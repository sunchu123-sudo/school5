/**
 * 前台資料：Supabase → localStorage → mock（由 getFallback 內含 storage 讀取邏輯）
 * fetchRemote 回傳 null 代表未設定、查無資料或查詢失敗；此時改用 getFallback。
 */
export async function resolveWithFallback<T>(options: {
  fetchRemote: () => Promise<T | null>;
  getFallback: () => T;
  hasData?: (data: T) => boolean;
}): Promise<T> {
  const { fetchRemote, getFallback, hasData = defaultHasData } = options;

  try {
    const remote = await fetchRemote();
    if (remote !== null && hasData(remote)) {
      return remote;
    }
  } catch (error) {
    console.warn("[dataFallback] Supabase 讀取失敗，改用備援資料", error);
  }

  return getFallback();
}

function defaultHasData<T>(data: T): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === "object") return Object.keys(data as object).length > 0;
  return true;
}
