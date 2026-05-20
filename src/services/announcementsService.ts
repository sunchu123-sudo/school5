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

function mapRow(row: AnnouncementRow): Announcement & { pinned?: boolean } {
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

function sortAnnouncements(list: (Announcement & { pinned?: boolean })[]) {
  return [...list].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return b.date.localeCompare(a.date);
  });
}

/** 僅從 Supabase 讀取；未設定或失敗回傳 null */
export async function fetchAnnouncements(): Promise<(Announcement & { pinned?: boolean })[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_visible", true)
    .order("is_pinned", { ascending: false })
    .order("date", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return sortAnnouncements(data.map((row) => mapRow(row as AnnouncementRow)));
}

/** 僅從 Supabase 依 id 讀取 */
export async function fetchAnnouncementById(
  id: string,
): Promise<(Announcement & { pinned?: boolean }) | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .eq("is_visible", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRow(data as AnnouncementRow);
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
