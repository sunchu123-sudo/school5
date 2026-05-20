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

function parseSideDishes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapRow(row: LunchMenuRow): PublicTodayLunch {
  return {
    main: row.main ?? "",
    mainDish: row.main_dish ?? "",
    sideDishes: parseSideDishes(row.side_dishes),
    soup: row.soup ?? "",
    fruit: row.fruit ?? "",
  };
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchTodayLunch(): Promise<PublicTodayLunch | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("lunch_menus")
    .select("*")
    .eq("date", todayDateString())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const lunch = mapRow(data as LunchMenuRow);
  const hasContent = lunch.main || lunch.mainDish || lunch.sideDishes.length > 0;
  return hasContent ? lunch : null;
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
