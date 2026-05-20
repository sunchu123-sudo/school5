import {
  announcements as mockAnnouncements,
  todayLunch as mockTodayLunch,
  events as mockEvents,
  albums as mockAlbums,
  schoolInfo as mockSchoolInfo,
  schoolIntroSections,
  locationInfo,
  downloadForms as mockDownloadForms,
  type Announcement,
  type AnnouncementCategory,
  type SchoolEvent,
  type Album,
} from "@/data/mock";
import {
  ADMIN_STORAGE_KEYS,
  isAdminAnnouncementArray,
  isAdminTodayLunchForm,
  isSchoolEventArray,
  isAlbumArray,
  isSchoolInfoRecord,
  isAdminFormArray,
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

export type AdminDashboardAnnouncement = Announcement & {
  pinned?: boolean;
  category: string;
};

function normalizeAdminAnnouncement(item: Record<string, unknown>): AdminDashboardAnnouncement {
  const content = String(item.content ?? "");
  const summary =
    typeof item.summary === "string" && item.summary.trim()
      ? item.summary
      : content.slice(0, 80);

  const announcement: AdminDashboardAnnouncement = {
    id: String(item.id),
    title: String(item.title),
    category: String(item.category),
    date: String(item.date),
    summary,
    content,
  };

  if (item.important) announcement.important = true;
  if (item.pinned === true) announcement.pinned = true;
  if (typeof item.attachmentUrl === "string") announcement.attachmentUrl = item.attachmentUrl;
  if (typeof item.externalUrl === "string") announcement.externalUrl = item.externalUrl;

  return announcement;
}

function readAdminAnnouncementsRaw(): AdminDashboardAnnouncement[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEYS.announcements);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAdminAnnouncementArray(parsed)) return null;
    return parsed.map(normalizeAdminAnnouncement);
  } catch {
    return null;
  }
}

/** 後台公告：優先讀 admin_announcements，保留後台原始分類與置頂狀態 */
export function getAdminAnnouncements(): AdminDashboardAnnouncement[] {
  const stored = readAdminAnnouncementsRaw();
  const list =
    stored ??
    mockAnnouncements.map((a) => ({
      ...a,
      pinned: false,
    }));

  return [...list].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
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
  /** 來自 Supabase lunch_menus.nutrition_note，無則省略 */
  nutritionNote?: string;
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

const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

function getWeekdayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAY_LABELS[d.getDay()] ?? "";
}

export type CalendarEvent = SchoolEvent & { important?: boolean };

function normalizeCalendarEvent(item: Record<string, unknown>): CalendarEvent {
  const date = String(item.date);
  const note =
    typeof item.note === "string"
      ? item.note
      : typeof item.description === "string"
        ? item.description
        : undefined;

  const event: CalendarEvent = {
    id: String(item.id),
    title: String(item.title),
    date,
    weekday: typeof item.weekday === "string" && item.weekday ? item.weekday : getWeekdayLabel(date),
    time: typeof item.time === "string" ? item.time : "",
    location: typeof item.location === "string" ? item.location : "",
    audience: typeof item.audience === "string" ? item.audience : "全校",
    category: item.category as SchoolEvent["category"],
    ...(note ? { note } : {}),
  };

  if (item.important === true || item.isImportant === true) {
    event.important = true;
  }

  return event;
}

function readStoredCalendarEvents(): CalendarEvent[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEYS.calendarEvents);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSchoolEventArray(parsed)) return null;
    return parsed.map(normalizeCalendarEvent);
  } catch {
    return null;
  }
}

/** 前台行事曆：優先讀 admin_calendar_events，否則使用 mock.ts */
export function getPublicCalendarEvents(): CalendarEvent[] {
  const stored = readStoredCalendarEvents();
  const list = stored ?? mockEvents.map((e) => ({ ...e }));
  return [...list].sort((a, b) => a.date.localeCompare(b.date));
}

const ADMIN_TO_DISPLAY_CATEGORY: Record<string, string> = {
  校園生活: "校園生活",
  戶外教學: "校外教學",
  體育活動: "運動會",
  文化課程: "民族教育",
  重要活動: "畢業典禮",
  其他: "班級活動",
};

function toDisplayCategory(category: string): string {
  return ADMIN_TO_DISPLAY_CATEGORY[category] ?? category;
}

export type PublicAlbum = Album & { isVisible?: boolean };

function buildPhotos(coverImage: string, photoCount: number, existing?: string[]): string[] {
  if (existing && existing.length > 0) return existing;
  const count = Math.min(Math.max(photoCount, 0), 12);
  return Array.from({ length: count || 1 }, () => coverImage || "/placeholder.svg");
}

function normalizeAlbum(item: Record<string, unknown>): PublicAlbum {
  const photoCount =
    typeof item.photoCount === "number" ? item.photoCount : Number(item.photoCount) || 0;
  const coverImage =
    typeof item.coverImage === "string" && item.coverImage ? item.coverImage : "/placeholder.svg";
  const existingPhotos = Array.isArray(item.photos)
    ? item.photos.filter((p): p is string => typeof p === "string")
    : undefined;

  const album: PublicAlbum = {
    id: String(item.id),
    title: String(item.title),
    date: String(item.date),
    category: String(item.category),
    photoCount,
    coverImage,
    description: typeof item.description === "string" ? item.description : "",
    photos: buildPhotos(coverImage, photoCount, existingPhotos),
  };

  if (item.isVisible === false) {
    album.isVisible = false;
  }

  return album;
}

function readStoredAlbums(): PublicAlbum[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEYS.albums);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAlbumArray(parsed)) return null;
    return parsed.map(normalizeAlbum);
  } catch {
    return null;
  }
}

function getAllAlbums(): PublicAlbum[] {
  const stored = readStoredAlbums();
  return stored ?? mockAlbums.map((a) => ({ ...a, isVisible: true }));
}

/** 前台相簿列表：優先讀 admin_albums，僅回傳 isVisible !== false 的相簿 */
export function getPublicAlbums(): PublicAlbum[] {
  return getAllAlbums()
    .filter((a) => a.isVisible !== false)
    .map((a) => ({ ...a, category: toDisplayCategory(a.category) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 前台相簿詳情：依 id 查找，找不到回傳 undefined */
export function getPublicAlbumById(id: string): PublicAlbum | undefined {
  const album = getAllAlbums().find((a) => a.id === id);
  if (!album || album.isVisible === false) return undefined;
  return { ...album, category: toDisplayCategory(album.category) };
}

export type PublicSchoolInfo = {
  name: string;
  phone: string;
  phoneTel: string;
  address: string;
  officeHours: string;
  email: string;
  mapText: string;
  mapUrl: string;
  intro?: string;
  vision?: string;
  transportation?: string;
};

function buildDefaultSchoolInfo(): PublicSchoolInfo {
  const introSection = schoolIntroSections.find((s) => s.title === "學校簡介");
  const visionSection = schoolIntroSections.find((s) => s.title === "學校願景");
  return {
    ...mockSchoolInfo,
    intro: introSection?.content ?? "",
    vision: visionSection?.content ?? "",
    transportation: locationInfo.transport.join("\n"),
  };
}

/** 僅 mock 衍生預設（地圖連結文字等），不含 localStorage；供 Supabase 列映射填補欄位 */
export function getStaticSchoolInfoDefaults(): PublicSchoolInfo {
  return buildDefaultSchoolInfo();
}

function normalizeSchoolInfo(item: Record<string, unknown>): PublicSchoolInfo {
  const base = buildDefaultSchoolInfo();
  return {
    name: typeof item.name === "string" ? item.name : base.name,
    phone: typeof item.phone === "string" ? item.phone : base.phone,
    phoneTel:
      typeof item.phoneTel === "string"
        ? item.phoneTel
        : typeof item.phone === "string"
          ? item.phone.replace(/\D/g, "")
          : base.phoneTel,
    address: typeof item.address === "string" ? item.address : base.address,
    officeHours: typeof item.officeHours === "string" ? item.officeHours : base.officeHours,
    email: typeof item.email === "string" ? item.email : base.email,
    mapText: typeof item.mapText === "string" ? item.mapText : base.mapText,
    mapUrl: typeof item.mapUrl === "string" ? item.mapUrl : base.mapUrl,
    intro: typeof item.intro === "string" ? item.intro : base.intro,
    vision: typeof item.vision === "string" ? item.vision : base.vision,
    transportation:
      typeof item.transportation === "string" ? item.transportation : base.transportation,
  };
}

function readStoredSchoolInfo(): PublicSchoolInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEYS.schoolInfo);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSchoolInfoRecord(parsed)) return null;
    return normalizeSchoolInfo(parsed);
  } catch {
    return null;
  }
}

/** 前台學校資料：優先讀 admin_school_info，否則使用 mock.ts */
export function getPublicSchoolInfo(): PublicSchoolInfo {
  return readStoredSchoolInfo() ?? buildDefaultSchoolInfo();
}

export type PublicForm = {
  id: string;
  title: string;
  desc: string;
  category?: string;
  fileUrl?: string;
  isVisible?: boolean;
};

const MOCK_FORM_CATEGORY: Record<string, string> = {
  f1: "請假",
  f2: "校外教學",
  f3: "獎助學金",
  f4: "學生資料",
  f5: "家長志工",
};

function normalizeForm(item: Record<string, unknown>): PublicForm {
  const description =
    typeof item.description === "string"
      ? item.description
      : typeof item.desc === "string"
        ? item.desc
        : "";

  const form: PublicForm = {
    id: String(item.id),
    title: String(item.title),
    desc: description,
    category: typeof item.category === "string" ? item.category : "其他",
  };

  if (typeof item.fileUrl === "string" && item.fileUrl) {
    form.fileUrl = item.fileUrl;
  }
  if (item.isVisible === false) {
    form.isVisible = false;
  }

  return form;
}

function getDefaultForms(): PublicForm[] {
  return mockDownloadForms.map((f) => ({
    id: f.id,
    title: f.title,
    desc: f.desc,
    category: MOCK_FORM_CATEGORY[f.id] ?? "其他",
    isVisible: true,
  }));
}

function readStoredForms(): PublicForm[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEYS.forms);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAdminFormArray(parsed)) return null;
    return parsed.map(normalizeForm);
  } catch {
    return null;
  }
}

function getAllForms(): PublicForm[] {
  return readStoredForms() ?? getDefaultForms();
}

/** 前台表單列表：優先讀 admin_forms，僅回傳 isVisible !== false 的表單 */
export function getPublicForms(): PublicForm[] {
  return getAllForms().filter((f) => f.isVisible !== false);
}

/** 後台相簿：優先讀 admin_albums，包含前台隱藏的相簿 */
export function getAdminAlbums(): PublicAlbum[] {
  return getAllAlbums();
}

/** 後台表單：優先讀 admin_forms，包含前台隱藏的表單 */
export function getAdminForms(): PublicForm[] {
  return getAllForms();
}
