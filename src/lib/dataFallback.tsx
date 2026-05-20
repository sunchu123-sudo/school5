import { useEffect, useState } from "react";

/**
 * Supabase → localStorage → mock 備援解析。
 * fetchRemote 回傳 null 代表未設定或查詢失敗；hasData 為 false 時改用 getFallback。
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

/** 前台非同步資料載入 hook；loader 應來自 service 模組（穩定引用） */
export function usePublicData<T>(
  loader: () => Promise<T>,
  getFallback: () => T,
): { data: T; loading: boolean; isEmpty: boolean } {
  const [data, setData] = useState<T>(getFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loader()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(getFallback());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loader, getFallback]);

  const isEmpty = Array.isArray(data)
    ? data.length === 0
    : data === null || data === undefined;

  return { data, loading, isEmpty };
}

/** 依 id 載入單筆資料 */
export function usePublicDataById<T>(
  id: string | undefined,
  loader: (id: string) => Promise<T | null>,
  getFallbackById: (id: string) => T | null | undefined,
): { data: T | null | undefined; loading: boolean } {
  const [data, setData] = useState<T | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    resolveWithFallback({
      fetchRemote: () => loader(id),
      getFallback: () => getFallbackById(id) ?? null,
      hasData: (item) => item !== null && item !== undefined,
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(getFallbackById(id) ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, loader, getFallbackById]);

  return { data, loading };
}

export function PublicDataLoading({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-center text-sm text-muted-foreground py-6"}>資料載入中…</p>
  );
}

export function PublicDataEmpty({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-center text-sm text-muted-foreground py-12"}>目前暫無資料</p>
  );
}
