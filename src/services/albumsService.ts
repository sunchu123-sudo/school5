import type { Album } from "@/data/mock";
import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicAlbumById, getPublicAlbums, type PublicAlbum } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

const ADMIN_TO_DISPLAY_CATEGORY: Record<string, string> = {
  校園生活: "校園生活",
  戶外教學: "校外教學",
  體育活動: "運動會",
  文化課程: "民族教育",
  重要活動: "畢業典禮",
  其他: "班級活動",
  校園日常: "校園生活",
  校外教學: "校外教學",
  民族教育: "民族教育",
};

/** 種子／前台分類字串 → 後台管理分類（與 AdminAlbums MOCK_TO_ADMIN 對齊） */
const SEED_DISPLAY_TO_ADMIN: Record<string, string> = {
  運動會: "體育活動",
  校外教學: "戶外教學",
  民族教育: "文化課程",
  社團活動: "校園生活",
  班級活動: "校園生活",
  校園生活: "校園生活",
  畢業典禮: "重要活動",
};

const ADMIN_CATEGORY_SET = new Set([
  "校園生活",
  "戶外教學",
  "體育活動",
  "文化課程",
  "重要活動",
  "其他",
]);

function toDisplayCategory(category: string): string {
  return ADMIN_TO_DISPLAY_CATEGORY[category] ?? category;
}

function rowToAdminCategory(raw: string): string {
  if (ADMIN_CATEGORY_SET.has(raw)) return raw;
  return SEED_DISPLAY_TO_ADMIN[raw] ?? "其他";
}

type AlbumRow = {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string | null;
  photo_count: number;
  cover_image: string | null;
  is_visible: boolean;
};

function buildPhotos(coverImage: string, photoCount: number): string[] {
  const count = Math.min(Math.max(photoCount, 0), 12);
  return Array.from({ length: count || 1 }, () => coverImage || "/placeholder.svg");
}

function mapRow(row: AlbumRow): PublicAlbum {
  const coverImage = row.cover_image || "/placeholder.svg";
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    category: toDisplayCategory(row.category),
    photoCount: row.photo_count ?? 0,
    coverImage,
    description: row.description ?? "",
    photos: buildPhotos(coverImage, row.photo_count ?? 0),
    isVisible: row.is_visible !== false,
  };
}

/** 後台相簿列（分類為後台分類字串） */
export type AdminAlbumRecord = Album & { isVisible: boolean };

function mapRowToAdmin(row: AlbumRow): AdminAlbumRecord {
  const coverImage = row.cover_image || "/placeholder.svg";
  const photoCount = row.photo_count ?? 0;
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    category: rowToAdminCategory(row.category),
    photoCount,
    coverImage,
    description: row.description ?? "",
    photos: buildPhotos(coverImage, photoCount),
    isVisible: row.is_visible !== false,
  };
}

export type AlbumWriteInput = {
  title: string;
  date: string;
  category: string;
  description: string;
  photoCount: number;
  coverImage: string;
  isVisible?: boolean;
};

function toDbRow(data: AlbumWriteInput): Record<string, unknown> {
  return {
    title: data.title.trim(),
    date: data.date,
    category: data.category,
    description: data.description.trim() || null,
    photo_count: Math.min(Math.max(data.photoCount, 0), 12),
    cover_image: data.coverImage.trim() || null,
    is_visible: data.isVisible !== false,
  };
}

export function albumWriteFromForm(input: {
  title: string;
  date: string;
  category: string;
  description: string;
  photoCount: number;
  coverImage: string;
  isVisible: boolean;
}): AlbumWriteInput {
  return {
    title: input.title,
    date: input.date,
    category: input.category,
    description: input.description,
    photoCount: input.photoCount,
    coverImage: input.coverImage,
    isVisible: input.isVisible,
  };
}

/** 前台：僅 is_visible = true，依 date 降冪 */
export async function fetchAlbums(): Promise<PublicAlbum[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("is_visible", true)
      .order("date", { ascending: false });

    if (error) {
      console.warn("[albumsService] Supabase albums:", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    return data.map((row) => mapRow(row as AlbumRow));
  } catch (e) {
    console.warn("[albumsService] fetchAlbums 失敗", e);
    return null;
  }
}

/** 後台：全部相簿，依 date 降冪 */
export async function fetchAdminAlbums(): Promise<AdminAlbumRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("[albumsService] fetchAdminAlbums:", error.message);
      return null;
    }

    return (data ?? []).map((row) => mapRowToAdmin(row as AlbumRow));
  } catch (e) {
    console.error("[albumsService] fetchAdminAlbums 失敗", e);
    return null;
  }
}

export async function fetchAlbumById(id: string): Promise<PublicAlbum | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("id", id)
      .eq("is_visible", true)
      .maybeSingle();

    if (error) {
      console.warn("[albumsService] Supabase album by id:", error.message);
      return null;
    }
    if (!data) return null;

    return mapRow(data as AlbumRow);
  } catch (e) {
    console.warn("[albumsService] fetchAlbumById 失敗", e);
    return null;
  }
}

export async function createAlbum(data: AlbumWriteInput): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: inserted, error } = await supabase.from("albums").insert(toDbRow(data)).select("id").single();

    if (error) {
      console.error("[albumsService] createAlbum:", error.message);
      return null;
    }
    if (!inserted || typeof (inserted as { id?: string }).id !== "string") return null;
    return { id: (inserted as { id: string }).id };
  } catch (e) {
    console.error("[albumsService] createAlbum 失敗", e);
    return null;
  }
}

export async function updateAlbum(id: string, data: AlbumWriteInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("albums").update(toDbRow(data)).eq("id", id);

    if (error) {
      console.error("[albumsService] updateAlbum:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[albumsService] updateAlbum 失敗", e);
    return false;
  }
}

export async function deleteAlbum(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("albums").delete().eq("id", id);

    if (error) {
      console.error("[albumsService] deleteAlbum:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[albumsService] deleteAlbum 失敗", e);
    return false;
  }
}

export async function loadPublicAlbums(): Promise<PublicAlbum[]> {
  return resolveWithFallback({
    fetchRemote: fetchAlbums,
    getFallback: () => getPublicAlbums(),
  });
}

export async function loadPublicAlbumById(id: string): Promise<PublicAlbum | null> {
  return resolveWithFallback({
    fetchRemote: () => fetchAlbumById(id),
    getFallback: () => getPublicAlbumById(id) ?? null,
    hasData: (item) => item !== null,
  });
}

export function getFallbackAlbumById(id: string): PublicAlbum | undefined {
  return getPublicAlbumById(id);
}

export type { PublicAlbum, Album };
