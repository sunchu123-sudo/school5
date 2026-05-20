import { useEffect, useRef, useState } from "react";
import { resolveWithFallback } from "@/lib/dataFallback";

/** 前台非同步資料載入 hook；loader 應來自 service 模組（穩定引用） */
export function usePublicData<T>(
  loader: () => Promise<T>,
  getFallback: () => T,
): { data: T; loading: boolean; isEmpty: boolean } {
  const [data, setData] = useState<T>(() => getFallback());
  const [loading, setLoading] = useState(true);

  const loaderRef = useRef(loader);
  const fallbackRef = useRef(getFallback);
  loaderRef.current = loader;
  fallbackRef.current = getFallback;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loaderRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(fallbackRef.current());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const loaderRef = useRef(loader);
  const fallbackRef = useRef(getFallbackById);
  loaderRef.current = loader;
  fallbackRef.current = getFallbackById;

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    resolveWithFallback({
      fetchRemote: () => loaderRef.current(id),
      getFallback: () => fallbackRef.current(id) ?? null,
      hasData: (item) => item !== null && item !== undefined,
    })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(fallbackRef.current(id) ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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
