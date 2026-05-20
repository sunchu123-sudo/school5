import type { Announcement, AnnouncementCategory } from "@/data/mock";
import { announcements as mockAnnouncements } from "@/data/mock";
import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicAnnouncements } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

const ADMIN_TO_MOCK_CATEGORY: Record<string, AnnouncementCategory> = {
  學校公告: "行政公告",
  活動通知: "活動通知",
  家長通知: "班級通知",
  午餐資訊: "午餐健康",
  其他: "行政公告",
};

type AnnouncementRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  date: string;
  is_important: boolean;
  is_pinned: boolean;
  external_link: string | null;
  attachments: unknown;
  is_visible: boolean;
};

/** 後台列表／編輯用（分類維持資料庫字串，不轉 mock 分類） */
export type AdminAnnouncementRecord = {
  id: string;
  title: string;
  category: string;
  content: string;
  date: string;
  summary: string;
  important?: boolean;
  pinned?: boolean;
  attachmentUrl?: string;
  externalUrl?: string;
  isVisible?: boolean;
};

/** 寫入 Supabase 用（camelCase → 內部轉 snake_case） */
export type AnnouncementWriteInput = {
  title: string;
  category: string;
  content: string;
  date: string;
  isImportant: boolean;
  isPinned: boolean;
  externalLink?: string | null;
  /** JSON 陣列，可為字串網址或 { url: string } */
  attachments?: unknown;
  isVisible?: boolean;
};

function mapCategory(category: string): AnnouncementCategory {
  return (
    ADMIN_TO_MOCK_CATEGORY[category] ??
    (mockAnnouncements.some((a) => a.category === category)
      ? (category as AnnouncementCategory)
      : "行政公告")
  );
}

function firstAttachmentUrl(attachments: unknown): string | undefined {
  if (!Array.isArray(attachments) || attachments.length === 0) return undefined;
  const first = attachments[0];
  if (typeof first === "string" && first) return first;
  if (typeof first === "object" && first !== null && "url" in first) {
    const url = (first as { url: unknown }).url;
    if (typeof url === "string" && url) return url;
  }
  return undefined;
}

function mapRowForPublic(row: AnnouncementRow): Announcement & { pinned?: boolean } {
  const content = row.content ?? "";
  const announcement: Announcement & { pinned?: boolean } = {
    id: row.id,
    title: row.title,
    category: mapCategory(row.category),
    date: row.date,
    summary: content.slice(0, 80),
    content,
  };

  if (row.is_important) announcement.important = true;
  if (row.is_pinned) announcement.pinned = true;

  const attachmentUrl = firstAttachmentUrl(row.attachments);
  if (attachmentUrl) announcement.attachmentUrl = attachmentUrl;
  if (row.external_link) announcement.externalUrl = row.external_link;

  return announcement;
}

function mapRowForAdmin(row: AnnouncementRow): AdminAnnouncementRecord {
  const content = row.content ?? "";
  const summary = content.slice(0, 80);
  const rec: AdminAnnouncementRecord = {
    id: row.id,
    title: row.title ?? "",
    category: row.category ?? "其他",
    content,
    date: row.date,
    summary,
    important: !!row.is_important,
    pinned: !!row.is_pinned,
    isVisible: row.is_visible !== false,
  };
  const attachmentUrl = firstAttachmentUrl(row.attachments);
  if (attachmentUrl) rec.attachmentUrl = attachmentUrl;
  if (row.external_link) rec.externalUrl = row.external_link;
  return rec;
}

function sortAnnouncementsPublic(list: (Announcement & { pinned?: boolean })[]) {
  return [...list].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return b.date.localeCompare(a.date);
  });
}

function sortAnnouncementsAdmin(list: AdminAnnouncementRecord[]) {
  return [...list].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return b.date.localeCompare(a.date);
  });
}

function attachmentsToJsonb(attachments: unknown, attachmentUrl?: string): unknown {
  if (attachments !== undefined && attachments !== null) return attachments;
  if (typeof attachmentUrl === "string" && attachmentUrl.trim()) return [attachmentUrl.trim()];
  return [];
}

function writeInputToDbRow(data: AnnouncementWriteInput, id?: string): Record<string, unknown> {
  const row: Record<string, unknown> = {
    title: data.title.trim(),
    category: data.category,
    content: data.content.trim(),
    date: data.date,
    is_important: data.isImportant,
    is_pinned: data.isPinned,
    external_link: data.externalLink?.trim() || null,
    attachments: attachmentsToJsonb(data.attachments, undefined),
    is_visible: data.isVisible !== false,
  };
  if (id) row.id = id;
  return row;
}

/** 由後台表單（attachmentUrl 單欄）組出寫入 payload */
export function announcementWriteFromAdminForm(input: {
  title: string;
  category: string;
  content: string;
  date: string;
  important: boolean;
  pinned: boolean;
  attachmentUrl?: string;
  externalUrl?: string;
  isVisible?: boolean;
}): AnnouncementWriteInput {
  return {
    title: input.title,
    category: input.category,
    content: input.content,
    date: input.date,
    isImportant: input.important,
    isPinned: input.pinned,
    externalLink: input.externalUrl?.trim() || null,
    attachments:
      typeof input.attachmentUrl === "string" && input.attachmentUrl.trim()
        ? [input.attachmentUrl.trim()]
        : [],
    isVisible: input.isVisible !== false,
  };
}

/** 僅從 Supabase 讀取（前台）；未設定或失敗回傳 null */
export async function fetchAnnouncements(): Promise<(Announcement & { pinned?: boolean })[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_visible", true)
      .order("is_pinned", { ascending: false })
      .order("date", { ascending: false });

    if (error) {
      console.warn("[announcementsService] Supabase announcements:", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    return sortAnnouncementsPublic(data.map((r) => mapRowForPublic(r as AnnouncementRow)));
  } catch (e) {
    console.warn("[announcementsService] fetchAnnouncements 失敗", e);
    return null;
  }
}

/** 後台：讀取全部公告（含 is_visible = false） */
export async function fetchAdminAnnouncements(): Promise<AdminAnnouncementRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("date", { ascending: false });

    if (error) {
      console.error("[announcementsService] fetchAdminAnnouncements:", error.message);
      return null;
    }

    return sortAnnouncementsAdmin((data ?? []).map((r) => mapRowForAdmin(r as AnnouncementRow)));
  } catch (e) {
    console.error("[announcementsService] fetchAdminAnnouncements 失敗", e);
    return null;
  }
}

/**
 * 新增公告至 Supabase。
 * 正式環境若改為軟刪除，可改為 update is_visible = false 而非 delete（見 deleteAnnouncement）。
 */
export async function createAnnouncement(data: AnnouncementWriteInput): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const row = writeInputToDbRow(data);
  try {
    const { data: inserted, error } = await supabase.from("announcements").insert(row).select("id").single();

    if (error) {
      console.error("[announcementsService] createAnnouncement:", error.message);
      return null;
    }
    if (!inserted || typeof (inserted as { id?: string }).id !== "string") return null;
    return { id: (inserted as { id: string }).id };
  } catch (e) {
    console.error("[announcementsService] createAnnouncement 失敗", e);
    return null;
  }
}

export async function updateAnnouncement(id: string, data: AnnouncementWriteInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const row = writeInputToDbRow(data);
  delete row.id;

  try {
    const { error } = await supabase.from("announcements").update(row).eq("id", id);

    if (error) {
      console.error("[announcementsService] updateAnnouncement:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[announcementsService] updateAnnouncement 失敗", e);
    return false;
  }
}

/**
 * 硬刪除公告列。
 * 提醒：正式上線可改為 is_visible = false 軟刪除，以保留稽核與復原。
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      console.error("[announcementsService] deleteAnnouncement:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[announcementsService] deleteAnnouncement 失敗", e);
    return false;
  }
}

/** 僅從 Supabase 依 id 讀取（前台，僅可見） */
export async function fetchAnnouncementById(
  id: string,
): Promise<(Announcement & { pinned?: boolean }) | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .eq("is_visible", true)
      .maybeSingle();

    if (error) {
      console.warn("[announcementsService] Supabase announcement by id:", error.message);
      return null;
    }
    if (!data) return null;

    return mapRowForPublic(data as AnnouncementRow);
  } catch (e) {
    console.warn("[announcementsService] fetchAnnouncementById 失敗", e);
    return null;
  }
}

/** Supabase → localStorage → mock */
export async function loadPublicAnnouncements(): Promise<(Announcement & { pinned?: boolean })[]> {
  return resolveWithFallback({
    fetchRemote: fetchAnnouncements,
    getFallback: () => getPublicAnnouncements(),
  });
}

export async function loadPublicAnnouncementById(
  id: string,
): Promise<(Announcement & { pinned?: boolean }) | null> {
  return resolveWithFallback({
    fetchRemote: () => fetchAnnouncementById(id),
    getFallback: () => getPublicAnnouncements().find((a) => a.id === id) ?? null,
    hasData: (item) => item !== null,
  });
}

export function getFallbackAnnouncementById(id: string) {
  return getPublicAnnouncements().find((a) => a.id === id);
}
