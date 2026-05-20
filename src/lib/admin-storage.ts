export const ADMIN_STORAGE_KEYS = {
  announcements: "admin_announcements",
  todayLunch: "admin_today_lunch",
  loggedIn: "admin_logged_in",
  calendarEvents: "admin_calendar_events",
  albums: "admin_albums",
  schoolInfo: "admin_school_info",
  forms: "admin_forms",
} as const;

export interface AdminTodayLunchForm {
  main: string;
  mainDish: string;
  sideDish1: string;
  sideDish2: string;
  soup: string;
  fruit: string;
}

function readJson<T>(key: string, validate: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 瀏覽器可能拒絕寫入（私密模式、容量已滿等）
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isAdminAnnouncementArray(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.date === "string" &&
      typeof item.category === "string" &&
      typeof item.content === "string",
  );
}

export function isAdminTodayLunchForm(value: unknown): value is AdminTodayLunchForm {
  if (!isRecord(value)) return false;
  return (
    typeof value.main === "string" &&
    typeof value.mainDish === "string" &&
    typeof value.sideDish1 === "string" &&
    typeof value.sideDish2 === "string" &&
    typeof value.soup === "string" &&
    typeof value.fruit === "string"
  );
}

export function isSchoolEventArray(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.date === "string" &&
      typeof item.category === "string",
  );
}

export function isAlbumArray(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.date === "string" &&
      typeof item.category === "string",
  );
}

export function isSchoolInfoRecord(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.phone === "string" &&
    typeof value.address === "string"
  );
}

export function isAdminFormArray(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.category === "string",
  );
}

export function loadFromStorage<T>(key: string, validate: (value: unknown) => value is T): T | null {
  return readJson(key, validate);
}

export function saveToStorage(key: string, value: unknown): void {
  writeJson(key, value);
}

export function clearStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function lunchFromMock(lunch: {
  main: string;
  mainDish: string;
  sideDishes: string[];
  soup: string;
  fruit: string;
}): AdminTodayLunchForm {
  return {
    main: lunch.main,
    mainDish: lunch.mainDish,
    sideDish1: lunch.sideDishes[0] ?? "",
    sideDish2: lunch.sideDishes[1] ?? "",
    soup: lunch.soup,
    fruit: lunch.fruit,
  };
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ADMIN_STORAGE_KEYS.loggedIn) === "true";
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEYS.loggedIn, "true");
  } catch {
    // ignore
  }
}

export function clearAdminLoggedIn(): void {
  clearStorage(ADMIN_STORAGE_KEYS.loggedIn);
}
