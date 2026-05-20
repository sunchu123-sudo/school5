import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicSchoolInfo, getStaticSchoolInfoDefaults, type PublicSchoolInfo } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

type SchoolInfoRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  office_hours: string | null;
  email: string | null;
  intro: string | null;
  vision: string | null;
  transportation: string | null;
  map_url: string | null;
  updated_at?: string;
  created_at?: string;
};

/** 後台更新列時需帶 id；fetch 時一併回傳 */
export type SchoolInfoWithId = PublicSchoolInfo & { id: string };

/** 後台載入結果：有列、尚無列、或查詢錯誤 */
export type SchoolInfoAdminLoadResult =
  | { status: "ok"; row: SchoolInfoWithId }
  | { status: "empty" }
  | { status: "error" };

function mapRow(row: SchoolInfoRow, base: PublicSchoolInfo): PublicSchoolInfo {
  const phone = row.phone ?? base.phone;
  return {
    name: row.name ?? base.name,
    phone,
    phoneTel: phone.replace(/\D/g, "") || base.phoneTel,
    address: row.address ?? base.address,
    officeHours: row.office_hours ?? base.officeHours,
    email: row.email ?? base.email,
    mapText: base.mapText,
    mapUrl: row.map_url ?? base.mapUrl,
    intro: row.intro ?? base.intro,
    vision: row.vision ?? base.vision,
    transportation: row.transportation ?? base.transportation,
  };
}

function rowToWithId(row: SchoolInfoRow): SchoolInfoWithId {
  const base = getStaticSchoolInfoDefaults();
  return {
    id: row.id,
    ...mapRow(row, base),
  };
}

function toDbPayload(data: PublicSchoolInfo): Record<string, unknown> {
  return {
    name: data.name.trim() || getStaticSchoolInfoDefaults().name,
    phone: data.phone || null,
    address: data.address || null,
    office_hours: data.officeHours || null,
    email: data.email || null,
    intro: data.intro ?? null,
    vision: data.vision ?? null,
    transportation: data.transportation ?? null,
    map_url: data.mapUrl || null,
  };
}

/**
 * 讀取 school_info 一筆：以 updated_at 最新為主（多筆時穩定取同一規則）。
 */
export async function fetchSchoolInfo(): Promise<PublicSchoolInfo | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("school_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("[schoolService] Supabase school_info:", error.message);
      return null;
    }
    if (!data) return null;

    return mapRow(data as SchoolInfoRow, getStaticSchoolInfoDefaults());
  } catch (e) {
    console.warn("[schoolService] fetchSchoolInfo 失敗", e);
    return null;
  }
}

/** 後台載入：含列 id；空表為 empty 而非 error */
export async function fetchAdminSchoolInfo(): Promise<SchoolInfoAdminLoadResult> {
  if (!isSupabaseConfigured()) return { status: "error" };

  const supabase = getSupabaseClient();
  if (!supabase) return { status: "error" };

  try {
    const { data, error } = await supabase
      .from("school_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[schoolService] fetchAdminSchoolInfo:", error.message);
      return { status: "error" };
    }
    if (!data) return { status: "empty" };

    return { status: "ok", row: rowToWithId(data as SchoolInfoRow) };
  } catch (e) {
    console.error("[schoolService] fetchAdminSchoolInfo 失敗", e);
    return { status: "error" };
  }
}

/**
 * 若已有列則更新（優先 data.id，否則取 updated_at 最新一筆）；無列則 insert。
 */
export async function updateSchoolInfo(data: PublicSchoolInfo & { id?: string }): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const payload = toDbPayload(data);

  try {
    let targetId = data.id;

    if (!targetId) {
      const { data: row, error: selErr } = await supabase
        .from("school_info")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (selErr) {
        console.error("[schoolService] updateSchoolInfo 查詢列失敗:", selErr.message);
        return false;
      }
      targetId = (row as { id?: string } | null)?.id;
    }

    if (targetId) {
      const { error } = await supabase.from("school_info").update(payload).eq("id", targetId);
      if (error) {
        console.error("[schoolService] updateSchoolInfo update:", error.message);
        return false;
      }
      return true;
    }

    const { error } = await supabase.from("school_info").insert(payload);
    if (error) {
      console.error("[schoolService] updateSchoolInfo insert:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[schoolService] updateSchoolInfo 失敗", e);
    return false;
  }
}

export async function loadPublicSchoolInfo(): Promise<PublicSchoolInfo> {
  return resolveWithFallback({
    fetchRemote: fetchSchoolInfo,
    getFallback: () => getPublicSchoolInfo(),
    hasData: (info) => Boolean(info.name),
  });
}

export function getFallbackSchoolInfo(): PublicSchoolInfo {
  return getPublicSchoolInfo();
}
