import { todayLunch as mockTodayLunch } from "@/data/mock";
import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicTodayLunch, type PublicTodayLunch } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

type LunchMenuRow = {
  id: string;
  date: string;
  main: string | null;
  main_dish: string | null;
  side_dishes: unknown;
  soup: string | null;
  fruit: string | null;
  nutrition_note: string | null;
};

/** 後台／寫入用 camelCase */
export type LunchMenuWriteInput = {
  date: string;
  main: string;
  mainDish: string;
  sideDishes: string[];
  soup: string;
  fruit: string;
  nutritionNote?: string;
};

export type LunchMenuRecord = LunchMenuWriteInput & { id: string };

function parseSideDishes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapRow(row: LunchMenuRow): PublicTodayLunch {
  const lunch: PublicTodayLunch = {
    main: row.main ?? "",
    mainDish: row.main_dish ?? "",
    sideDishes: parseSideDishes(row.side_dishes),
    soup: row.soup ?? "",
    fruit: row.fruit ?? "",
  };
  const note = row.nutrition_note?.trim();
  if (note) lunch.nutritionNote = note;
  return lunch;
}

function mapRowToRecord(row: LunchMenuRow): LunchMenuRecord {
  const base = mapRow(row);
  return {
    id: row.id,
    date: row.date,
    main: base.main,
    mainDish: base.mainDish,
    sideDishes: base.sideDishes,
    soup: base.soup,
    fruit: base.fruit,
    nutritionNote: base.nutritionNote,
  };
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function hasLunchContent(l: PublicTodayLunch): boolean {
  return Boolean(l.main || l.mainDish || l.sideDishes.length || l.soup || l.fruit);
}

/** 讀取 lunch_menus 全部列表（日期新→舊） */
export async function fetchLunchMenus(): Promise<LunchMenuRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("lunch_menus")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("[lunchService] fetchLunchMenus:", error.message);
      return null;
    }
    if (!data) return [];

    return data.map((r) => mapRowToRecord(r as LunchMenuRow));
  } catch (e) {
    console.error("[lunchService] fetchLunchMenus 失敗", e);
    return null;
  }
}

/**
 * 前台用：優先今日；無今日則取 date 最新一筆。
 */
export async function fetchTodayLunch(): Promise<PublicTodayLunch | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const today = todayDateString();

  try {
    const { data: todayRow, error: errToday } = await supabase
      .from("lunch_menus")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    if (errToday) {
      console.warn("[lunchService] Supabase lunch_menus (today):", errToday.message);
    } else if (todayRow) {
      const lunch = mapRow(todayRow as LunchMenuRow);
      if (hasLunchContent(lunch)) return lunch;
    }

    const { data: latestRow, error: errLatest } = await supabase
      .from("lunch_menus")
      .select("*")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errLatest) {
      console.warn("[lunchService] Supabase lunch_menus (latest):", errLatest.message);
      return null;
    }
    if (!latestRow) return null;

    const lunch = mapRow(latestRow as LunchMenuRow);
    return hasLunchContent(lunch) ? lunch : null;
  } catch (e) {
    console.warn("[lunchService] fetchTodayLunch 失敗", e);
    return null;
  }
}

/** 後台初始載入：今日列優先，無則最新一筆，回傳含 id、date 之完整列 */
export async function fetchAdminLunchMenuRow(): Promise<LunchMenuRecord | null> {
  const menus = await fetchLunchMenus();
  if (!menus || menus.length === 0) return null;

  const today = todayDateString();
  const todayHit = menus.find((m) => m.date === today);
  return todayHit ?? menus[0] ?? null;
}

function writeInputToDbRow(data: LunchMenuWriteInput): Record<string, unknown> {
  return {
    date: data.date,
    main: data.main || null,
    main_dish: data.mainDish || null,
    side_dishes: data.sideDishes.filter(Boolean),
    soup: data.soup || null,
    fruit: data.fruit || null,
    nutrition_note: data.nutritionNote?.trim() || null,
  };
}

/** 依 date upsert（date 唯一） */
export async function upsertLunchMenu(data: LunchMenuWriteInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const row = writeInputToDbRow(data);

  try {
    const { error } = await supabase.from("lunch_menus").upsert(row, { onConflict: "date" });

    if (error) {
      console.error("[lunchService] upsertLunchMenu:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[lunchService] upsertLunchMenu 失敗", e);
    return false;
  }
}

export async function loadPublicTodayLunch(): Promise<PublicTodayLunch> {
  return resolveWithFallback({
    fetchRemote: fetchTodayLunch,
    getFallback: () => getPublicTodayLunch(),
    hasData: (lunch) =>
      Boolean(lunch.main || lunch.mainDish || lunch.sideDishes.length || lunch.soup || lunch.fruit),
  });
}

export function getFallbackTodayLunch(): PublicTodayLunch {
  return getPublicTodayLunch();
}

export function getMockTodayLunch(): PublicTodayLunch {
  return {
    main: mockTodayLunch.main,
    mainDish: mockTodayLunch.mainDish,
    sideDishes: [...mockTodayLunch.sideDishes],
    soup: mockTodayLunch.soup,
    fruit: mockTodayLunch.fruit,
  };
}
