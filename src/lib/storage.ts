import {
  announcements as mockAnnouncements,
  todayLunch as mockTodayLunch,
  type Announcement,
  type AnnouncementCategory,
} from "@/data/mock";
import {
  ADMIN_STORAGE_KEYS,
  isAdminAnnouncementArray,
  isAdminTodayLunchForm,
} from "@/lib/admin-storage";

/**
 * 安全讀取 localStorage；無 window、無資料或 JSON 解析失敗時回傳 fallback。
 */
export function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const ADMIN_TO_MOCK_CATEGORY: Record<string, AnnouncementCategory> = {
  學校公告: "行政公告",
  活動通知: "活動通知",
  家長通知: "班級通知",
  午餐資訊: "午餐健康",
  其他: "行政公告",
};

function normalizeStoredAnnouncement(item: Record<string, unknown>): Announcement {
  const rawCategory = String(item.category);
  const category =
    ADMIN_TO_MOCK_CATEGORY[rawCategory] ??
    (mockAnnouncements.some((a) => a.category === rawCategory)
      ? (rawCategory as AnnouncementCategory)
      : "行政公告");

  const content = String(item.content ?? "");
  const summary =
    typeof item.summary === "string" && item.summary.trim()
      ? item.summary
      : content.slice(0, 80);

  const normalized: Announcement = {
    id: String(item.id),
    title: String(item.title),
    category,
    date: String(item.date),
    summary,
    content,
  };

  if (item.important) normalized.important = true;
  if (typeof item.attachmentUrl === "string") normalized.attachmentUrl = item.attachmentUrl;
  if (typeof item.externalUrl === "string") normalized.externalUrl = item.externalUrl;

  return normalized;
}

function readStoredAnnouncements(): Announcement[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEYS.announcements);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAdminAnnouncementArray(parsed)) return null;
    return parsed.map(normalizeStoredAnnouncement);
  } catch {
    return null;
  }
}

/** 前台公告：優先讀 admin_announcements，否則使用 mock.ts */
export function getPublicAnnouncements(): Announcement[] {
  const stored = readStoredAnnouncements();
  const list = stored ?? [...mockAnnouncements];

  return [...list].sort((a, b) => {
    const aPinned = (a as Announcement & { pinned?: boolean }).pinned ? 1 : 0;
    const bPinned = (b as Announcement & { pinned?: boolean }).pinned ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return b.date.localeCompare(a.date);
  });
}

export type PublicTodayLunch = {
  main: string;
  mainDish: string;
  sideDishes: string[];
  soup: string;
  fruit: string;
};

/** 前台今日午餐：優先讀 admin_today_lunch，否則使用 mock.ts */
export function getPublicTodayLunch(): PublicTodayLunch {
  const stored = getStoredData<unknown>(ADMIN_STORAGE_KEYS.todayLunch, null);
  if (stored !== null && isAdminTodayLunchForm(stored)) {
    return {
      main: stored.main,
      mainDish: stored.mainDish,
      sideDishes: [stored.sideDish1, stored.sideDish2].filter(Boolean),
      soup: stored.soup,
      fruit: stored.fruit,
    };
  }
  return {
    main: mockTodayLunch.main,
    mainDish: mockTodayLunch.mainDish,
    sideDishes: [...mockTodayLunch.sideDishes],
    soup: mockTodayLunch.soup,
    fruit: mockTodayLunch.fruit,
  };
}
