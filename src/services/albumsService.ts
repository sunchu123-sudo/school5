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

function toDisplayCategory(category: string): string {
  return ADMIN_TO_DISPLAY_CATEGORY[category] ?? category;
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

export async function fetchAlbums(): Promise<PublicAlbum[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("is_visible", true)
    .order("date", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return data.map((row) => mapRow(row as AlbumRow));
}

export async function fetchAlbumById(id: string): Promise<PublicAlbum | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .eq("is_visible", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRow(data as AlbumRow);
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
