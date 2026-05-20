import { ADMIN_STORAGE_KEYS } from "@/lib/admin-storage";

export const BACKUP_APP_NAME = "三棧國小行動校園 App";
export const BACKUP_VERSION = "v1.0-local-backup";

export const BACKUP_DATA_KEYS = [
  ADMIN_STORAGE_KEYS.announcements,
  ADMIN_STORAGE_KEYS.calendarEvents,
  ADMIN_STORAGE_KEYS.todayLunch,
  ADMIN_STORAGE_KEYS.albums,
  ADMIN_STORAGE_KEYS.schoolInfo,
  ADMIN_STORAGE_KEYS.forms,
] as const;

export type BackupDataKey = (typeof BACKUP_DATA_KEYS)[number];

export interface AdminBackupPayload {
  appName: string;
  version: string;
  exportedAt: string;
  data: Partial<Record<BackupDataKey, unknown>>;
}

type BackupResult = { ok: true } | { ok: false; error: string };

export type ImportBackupResult =
  | { ok: true; importedKeys: BackupDataKey[] }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 檢查 localStorage 是否可用（私密模式、容量已滿等情況會失敗） */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__admin_backup_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function readRawStoredValue(key: string): unknown | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function buildBackupPayload(): AdminBackupPayload {
  const data: Partial<Record<BackupDataKey, unknown>> = {};

  for (const key of BACKUP_DATA_KEYS) {
    const value = readRawStoredValue(key);
    if (value !== null) {
      data[key] = value;
    }
  }

  return {
    appName: BACKUP_APP_NAME,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function getBackupFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `school-campus-backup-${date}.json`;
}

export function downloadBackup(): BackupResult {
  if (!isLocalStorageAvailable()) {
    return {
      ok: false,
      error: "無法使用瀏覽器暫存空間，請確認未使用私密瀏覽模式或儲存空間已滿。",
    };
  }

  try {
    const payload = buildBackupPayload();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getBackupFilename();
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: "匯出備份檔時發生錯誤，請稍後再試。" };
  }
}

export function importBackupData(parsed: unknown): ImportBackupResult {
  if (!isLocalStorageAvailable()) {
    return { ok: false, error: "無法使用瀏覽器暫存空間，無法匯入備份資料。" };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: "備份檔格式不正確，請選擇有效的 JSON 備份檔。" };
  }

  if (!("data" in parsed) || !isRecord(parsed.data)) {
    return { ok: false, error: "備份檔缺少 data 欄位，無法匯入。" };
  }

  const importedKeys: BackupDataKey[] = [];

  try {
    for (const key of BACKUP_DATA_KEYS) {
      if (!(key in parsed.data)) continue;
      localStorage.setItem(key, JSON.stringify(parsed.data[key]));
      importedKeys.push(key);
    }

    if (importedKeys.length === 0) {
      return { ok: false, error: "備份檔中沒有可匯入的資料項目。" };
    }

    return { ok: true, importedKeys };
  } catch {
    return { ok: false, error: "寫入暫存資料失敗，請確認瀏覽器儲存空間是否足夠。" };
  }
}

export async function importBackupFromFile(file: File): Promise<ImportBackupResult> {
  const isJsonFile =
    file.name.toLowerCase().endsWith(".json") ||
    file.type === "application/json" ||
    file.type === "text/json";

  if (!isJsonFile) {
    return { ok: false, error: "請選擇 JSON 格式的備份檔（.json）。" };
  }

  let parsed: unknown;
  try {
    const text = await file.text();
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: "無法解析 JSON 檔案，請確認檔案格式是否正確。" };
  }

  return importBackupData(parsed);
}

export function clearAllBackupData(): BackupResult {
  if (!isLocalStorageAvailable()) {
    return { ok: false, error: "無法使用瀏覽器暫存空間。" };
  }

  try {
    for (const key of BACKUP_DATA_KEYS) {
      localStorage.removeItem(key);
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "清除暫存資料時發生錯誤，請稍後再試。" };
  }
}
