import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

export const ALBUM_PHOTOS_BUCKET = "album-photos";

/** 單本相簿最多照片張數 */
export const MAX_ALBUM_PHOTOS = 12;

/** 單檔上限 5MB */
export const MAX_ALBUM_PHOTO_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function isRemotePhotoUrl(url: string): boolean {
  const u = url.trim();
  return u.startsWith("http://") || u.startsWith("https://");
}

export function isPlaceholderPhoto(url: string): boolean {
  const u = url.trim();
  return !u || u === "/placeholder.svg" || u.startsWith("/placeholder");
}

/** 從 DB jsonb 或封面欄位組出照片 URL 列表 */
export function resolvePhotoUrls(
  photosJson: unknown,
  coverImage: string | null | undefined,
  photoCount: number,
): string[] {
  if (Array.isArray(photosJson)) {
    const list = photosJson
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .map((p) => p.trim())
      .filter((p) => !isPlaceholderPhoto(p));
    if (list.length > 0) return list.slice(0, MAX_ALBUM_PHOTOS);
  }

  const cover = coverImage?.trim() || "/placeholder.svg";
  if (isPlaceholderPhoto(cover)) {
    const count = Math.min(Math.max(photoCount, 0), MAX_ALBUM_PHOTOS) || 1;
    return Array.from({ length: count }, () => "/placeholder.svg");
  }

  const count = Math.min(Math.max(photoCount, 0), MAX_ALBUM_PHOTOS) || 1;
  return Array.from({ length: count }, () => cover);
}

function safeExt(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export type UploadAlbumPhotosResult = {
  urls: string[];
  errors: string[];
};

/**
 * 上傳多張照片至 Storage：{albumId}/{uuid}.ext
 * 需已執行 album-photos bucket 與 dev storage 政策。
 */
export async function uploadAlbumPhotos(
  albumId: string,
  files: File[],
): Promise<UploadAlbumPhotosResult> {
  if (!isSupabaseConfigured()) {
    return { urls: [], errors: ["未設定 Supabase"] };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { urls: [], errors: ["無法建立 Supabase 連線"] };

  const urls: string[] = [];
  const errors: string[] = [];
  const slice = files.slice(0, MAX_ALBUM_PHOTOS);

  for (const file of slice) {
    if (!ALLOWED_MIME.has(file.type)) {
      errors.push(`${file.name}：僅支援 JPG、PNG、WebP、GIF`);
      continue;
    }
    if (file.size > MAX_ALBUM_PHOTO_BYTES) {
      errors.push(`${file.name}：超過 5MB 上限`);
      continue;
    }

    const path = `${albumId}/${crypto.randomUUID()}.${safeExt(file)}`;
    const { error } = await supabase.storage.from(ALBUM_PHOTOS_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("[albumStorageService] upload:", error.message);
      errors.push(`${file.name}：${error.message}`);
      continue;
    }

    const { data } = supabase.storage.from(ALBUM_PHOTOS_BUCKET).getPublicUrl(path);
    if (data.publicUrl) urls.push(data.publicUrl);
  }

  return { urls, errors };
}

/** 刪除相簿資料夾內所有 Storage 物件（刪除相簿時呼叫） */
export async function removeAlbumStorageFolder(albumId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data: listed, error: listErr } = await supabase.storage
      .from(ALBUM_PHOTOS_BUCKET)
      .list(albumId, { limit: 200 });

    if (listErr) {
      console.error("[albumStorageService] list:", listErr.message);
      return;
    }

    if (!listed?.length) return;

    const paths = listed.map((f) => `${albumId}/${f.name}`);
    const { error: rmErr } = await supabase.storage.from(ALBUM_PHOTOS_BUCKET).remove(paths);
    if (rmErr) console.error("[albumStorageService] remove:", rmErr.message);
  } catch (e) {
    console.error("[albumStorageService] removeAlbumStorageFolder 失敗", e);
  }
}
