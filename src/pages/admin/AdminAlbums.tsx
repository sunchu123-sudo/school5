import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Search, X, RotateCcw, ImageIcon, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { albums as mockAlbums } from "@/data/mock";
import { formatAdminDate } from "@/lib/admin-ui";
import {
  ADMIN_STORAGE_KEYS,
  clearStorage,
  isAlbumArray,
  loadFromStorage,
  saveToStorage,
} from "@/lib/admin-storage";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  albumWriteFromForm,
  createAlbum,
  deleteAlbum,
  fetchAdminAlbums,
  type AdminAlbumRecord,
  updateAlbum,
} from "@/services/albumsService";

type AdminAlbum = AdminAlbumRecord;

const ADMIN_CATEGORIES = ["校園生活", "戶外教學", "體育活動", "文化課程", "重要活動", "其他"] as const;
type AdminAlbumCategory = (typeof ADMIN_CATEGORIES)[number];
const FILTER_CATEGORIES = ["全部", ...ADMIN_CATEGORIES] as const;

const MOCK_TO_ADMIN: Record<string, AdminAlbumCategory> = {
  運動會: "體育活動",
  校外教學: "戶外教學",
  民族教育: "文化課程",
  社團活動: "校園生活",
  班級活動: "校園生活",
  校園生活: "校園生活",
  畢業典禮: "重要活動",
};

type FormState = {
  title: string;
  date: string;
  category: AdminAlbumCategory;
  description: string;
  photoCount: string;
  coverImage: string;
  isVisible: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "校園生活",
  description: "",
  photoCount: "12",
  coverImage: "/placeholder.svg",
  isVisible: true,
});

function buildPhotos(coverImage: string, photoCount: number, existing?: string[]): string[] {
  if (existing && existing.length > 0) return existing;
  const count = Math.min(Math.max(photoCount, 0), 12);
  return Array.from({ length: count || 1 }, () => coverImage || "/placeholder.svg");
}

function normalizeAlbum(item: Record<string, unknown>): AdminAlbum {
  const photoCount =
    typeof item.photoCount === "number" ? item.photoCount : Number(item.photoCount) || 0;
  const coverImage =
    typeof item.coverImage === "string" && item.coverImage ? item.coverImage : "/placeholder.svg";
  const existingPhotos = Array.isArray(item.photos)
    ? item.photos.filter((p): p is string => typeof p === "string")
    : undefined;

  return {
    id: String(item.id),
    title: String(item.title),
    date: String(item.date),
    category: String(item.category),
    photoCount,
    coverImage,
    description: typeof item.description === "string" ? item.description : "",
    photos: buildPhotos(coverImage, photoCount, existingPhotos),
    isVisible: item.isVisible !== false,
  };
}

function getDefaultAlbums(): AdminAlbum[] {
  return mockAlbums.map((a) => ({
    ...a,
    category: MOCK_TO_ADMIN[a.category] ?? "其他",
    isVisible: true,
  }));
}

function loadInitialAlbums(): AdminAlbum[] {
  const stored = loadFromStorage(ADMIN_STORAGE_KEYS.albums, isAlbumArray);
  if (stored) return stored.map(normalizeAlbum);
  return getDefaultAlbums();
}

function persistAlbums(list: AdminAlbum[]) {
  saveToStorage(ADMIN_STORAGE_KEYS.albums, list);
}

async function fetchCloudAlbumsList(): Promise<AdminAlbum[] | null> {
  if (!isSupabaseConfigured()) return null;
  const raw = await fetchAdminAlbums();
  if (raw === null) return null;
  return raw;
}

function matchesSearch(item: AdminAlbum, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
  );
}

export default function AdminAlbums() {
  const [list, setList] = useState<AdminAlbum[]>([]);
  const [useCloud, setUseCloud] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("全部");
  const [formOpen, setFormOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<AdminAlbum | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          const raw = await fetchAdminAlbums();
          if (cancelled) return;
          if (raw !== null) {
            setUseCloud(true);
            setList(raw);
            persistAlbums(raw);
            setHydrated(true);
            return;
          }
          console.error("[AdminAlbums] fetchAdminAlbums 回傳 null");
          toast.error("雲端資料庫讀取失敗，已改用瀏覽器暫存資料。");
        } catch (e) {
          console.error("[AdminAlbums] 初始載入雲端失敗", e);
          if (!cancelled) toast.error("雲端資料庫讀取失敗，已改用瀏覽器暫存資料。");
        }
      }
      if (!cancelled) {
        setUseCloud(false);
        setList(loadInitialAlbums());
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    return [...list]
      .filter((a) => {
        const matchCategory = categoryFilter === "全部" || a.category === categoryFilter;
        const matchSearch = matchesSearch(a, q);
        return matchCategory && matchSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [list, searchQuery, categoryFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (item: AdminAlbum) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      date: item.date,
      category: (ADMIN_CATEGORIES.includes(item.category as AdminAlbumCategory)
        ? item.category
        : "其他") as AdminAlbumCategory,
      description: item.description,
      photoCount: String(item.photoCount),
      coverImage: item.coverImage,
      isVisible: item.isVisible !== false,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("請填寫相簿名稱");
      return;
    }

    const photoCount = Math.max(0, Number(form.photoCount) || 0);
    const coverImage = form.coverImage.trim() || "/placeholder.svg";
    const writePayload = albumWriteFromForm({
      title: form.title.trim(),
      date: form.date,
      category: form.category,
      description: form.description.trim(),
      photoCount,
      coverImage,
      isVisible: form.isVisible,
    });

    const afterSaveClose = () => {
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    };

    const runLocalEdit = (fallbackMsg: string) => {
      if (editingId) {
        const next = list.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title: form.title.trim(),
                date: form.date,
                category: form.category,
                description: form.description.trim(),
                photoCount,
                coverImage,
                photos: buildPhotos(coverImage, photoCount, a.photos),
                isVisible: form.isVisible,
              }
            : a,
        );
        setList(next);
        persistAlbums(next);
        toast.success(fallbackMsg);
        if (previewItem?.id === editingId) {
          setPreviewItem(next.find((a) => a.id === editingId) ?? null);
        }
      } else {
        const newItem: AdminAlbum = {
          id: `al-${Date.now()}`,
          title: form.title.trim(),
          date: form.date,
          category: form.category,
          description: form.description.trim(),
          photoCount,
          coverImage,
          photos: buildPhotos(coverImage, photoCount),
          isVisible: form.isVisible,
        };
        const next = [...list, newItem];
        setList(next);
        persistAlbums(next);
        toast.success(fallbackMsg);
      }
      afterSaveClose();
    };

    if (useCloud && isSupabaseConfigured()) {
      try {
        if (editingId) {
          const ok = await updateAlbum(editingId, writePayload);
          if (ok) {
            const reloaded = await fetchCloudAlbumsList();
            if (reloaded !== null) {
              setList(reloaded);
              persistAlbums(reloaded);
              if (previewItem?.id === editingId) {
                const updated = reloaded.find((x) => x.id === editingId);
                if (updated) setPreviewItem(updated);
              }
              toast.success("已更新相簿並儲存至雲端");
              afterSaveClose();
              return;
            }
          }
        } else {
          const created = await createAlbum(writePayload);
          if (created?.id) {
            const reloaded = await fetchCloudAlbumsList();
            if (reloaded !== null) {
              setList(reloaded);
              persistAlbums(reloaded);
              toast.success("已新增相簿並儲存至雲端");
              afterSaveClose();
              return;
            }
          }
        }
      } catch (e) {
        console.error("[AdminAlbums] 雲端儲存失敗", e);
      }
      toast.error("雲端資料庫操作失敗，請稍後再試。");
      setUseCloud(false);
      runLocalEdit("已將變更儲存在此瀏覽器（雲端暫無法同步）");
      return;
    }

    if (editingId) {
      const next = list.map((a) =>
        a.id === editingId
          ? {
              ...a,
              title: form.title.trim(),
              date: form.date,
              category: form.category,
              description: form.description.trim(),
              photoCount,
              coverImage,
              photos: buildPhotos(coverImage, photoCount, a.photos),
              isVisible: form.isVisible,
            }
          : a,
      );
      setList(next);
      persistAlbums(next);
      if (previewItem?.id === editingId) {
        setPreviewItem(next.find((a) => a.id === editingId) ?? null);
      }
      toast.success("已更新相簿並儲存在此瀏覽器");
    } else {
      const newItem: AdminAlbum = {
        id: `al-${Date.now()}`,
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        description: form.description.trim(),
        photoCount,
        coverImage,
        photos: buildPhotos(coverImage, photoCount),
        isVisible: form.isVisible,
      };
      const next = [...list, newItem];
      setList(next);
      persistAlbums(next);
      toast.success("已新增相簿並儲存在此瀏覽器");
    }

    afterSaveClose();
  };

  const handleDelete = async (item: AdminAlbum) => {
    const ok = window.confirm(`確定要刪除「${item.title}」嗎？此操作無法復原（可使用「恢復預設相簿」還原 mock 資料）。`);
    if (!ok) return;

    let fallbackFromCloudFailure = false;

    if (useCloud && isSupabaseConfigured()) {
      try {
        const deleted = await deleteAlbum(item.id);
        if (deleted) {
          const reloaded = await fetchCloudAlbumsList();
          if (reloaded !== null) {
            setList(reloaded);
            persistAlbums(reloaded);
            if (previewItem?.id === item.id) setPreviewItem(null);
            toast.success("已刪除雲端相簿");
            return;
          }
        }
      } catch (e) {
        console.error("[AdminAlbums] 雲端刪除失敗", e);
      }
      toast.error("雲端資料庫操作失敗，請稍後再試。");
      setUseCloud(false);
      fallbackFromCloudFailure = true;
    }

    const next = list.filter((a) => a.id !== item.id);
    setList(next);
    persistAlbums(next);
    if (previewItem?.id === item.id) setPreviewItem(null);
    toast.success(fallbackFromCloudFailure ? "已從瀏覽器暫存移除相簿" : "已刪除相簿");
  };

  const handleReset = () => {
    if (useCloud && isSupabaseConfigured()) {
      toast.info("目前使用雲端資料庫，恢復預設功能暫不會清除雲端資料。");
      return;
    }
    const ok = window.confirm("確定要恢復預設相簿資料嗎？目前瀏覽器中的相簿修改將全部清除。");
    if (!ok) return;
    clearStorage(ADMIN_STORAGE_KEYS.albums);
    const defaults = getDefaultAlbums();
    setList(defaults);
    setPreviewItem(null);
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    toast.success("已恢復預設相簿資料");
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">相簿管理</h2>
        <p className="text-sm text-muted-foreground">資料載入中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">相簿管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {list.length} 本相簿 · 目前顯示 {filtered.length} 本
          </p>
          <p className="mt-1 text-xs font-medium text-foreground">
            {useCloud && isSupabaseConfigured()
              ? "目前資料來源：Supabase 雲端資料庫"
              : "目前資料來源：此瀏覽器暫存資料"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            恢復預設相簿
          </Button>
          <Button className="rounded-xl" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            新增相簿
          </Button>
        </div>
      </div>

      <div className="card-base flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋相簿名稱、分類或描述…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full rounded-xl sm:w-44">
            <SelectValue placeholder="分類篩選" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {previewItem && (
        <section className="card-base overflow-hidden border-l-4 border-l-primary">
          <div className="flex items-start justify-between gap-3 border-b border-border/40 bg-primary-soft/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">相簿預覽</h3>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 rounded-lg" onClick={() => setPreviewItem(null)}>
              <X className="h-4 w-4" />
              關閉
            </Button>
          </div>
          <div className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40">
              {previewItem.coverImage ? (
                <img src={previewItem.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h4 className="text-lg font-bold leading-snug">{previewItem.title}</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{previewItem.category}</Badge>
                {previewItem.isVisible === false ? (
                  <Badge variant="outline" className="text-muted-foreground">
                    <EyeOff className="mr-1 h-3 w-3" />
                    前台隱藏
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    前台顯示
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatAdminDate(previewItem.date)} · {previewItem.photoCount} 張
              </p>
              {previewItem.description && (
                <p className="text-sm leading-relaxed text-foreground">{previewItem.description}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="card-base col-span-full p-8 text-center text-sm text-muted-foreground">
            找不到符合條件的相簿
          </p>
        ) : (
          filtered.map((al) => (
            <article
              key={al.id}
              className={`card-base p-4 ${previewItem?.id === al.id ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {al.coverImage ? (
                    <img src={al.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{al.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatAdminDate(al.date)} · {al.photoCount} 張
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="font-normal">
                      {al.category}
                    </Badge>
                    {al.isVisible === false ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        前台隱藏
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        前台顯示
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {al.description && (
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{al.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant={previewItem?.id === al.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setPreviewItem(al)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  預覽
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(al)}>
                  <Pencil className="h-3.5 w-3.5" />
                  編輯
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void handleDelete(al)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  刪除
                </Button>
              </div>
            </article>
          ))
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯相簿" : "新增相簿"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="alb-title">相簿名稱</Label>
              <Input
                id="alb-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
                placeholder="請輸入相簿名稱"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alb-date">日期</Label>
                <Input
                  id="alb-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>分類</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as AdminAlbumCategory }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alb-description">描述</Label>
              <Textarea
                id="alb-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-[80px] rounded-xl"
                placeholder="相簿描述"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alb-count">照片數</Label>
                <Input
                  id="alb-count"
                  type="number"
                  min={0}
                  value={form.photoCount}
                  onChange={(e) => setForm((f) => ({ ...f, photoCount: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alb-cover">封面圖片網址</Label>
                <Input
                  id="alb-cover"
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                  className="rounded-xl"
                  placeholder="/placeholder.svg"
                />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.isVisible}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isVisible: v === true }))}
              />
              顯示於前台
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setFormOpen(false)}>
              取消
            </Button>
            <Button className="rounded-xl" onClick={() => void handleSave()}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
