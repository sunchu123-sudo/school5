import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Search, X, RotateCcw, AlertCircle } from "lucide-react";
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
import { events as mockEvents, type SchoolEvent } from "@/data/mock";
import { formatAdminDate } from "@/lib/admin-ui";
import {
  ADMIN_STORAGE_KEYS,
  clearStorage,
  isSchoolEventArray,
  loadFromStorage,
  saveToStorage,
} from "@/lib/admin-storage";
import type { CalendarEvent } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  calendarWriteFromForm,
  createCalendarEvent,
  deleteCalendarEvent,
  fetchAdminCalendarEvents,
  updateCalendarEvent,
} from "@/services/calendarService";

const CATEGORIES: SchoolEvent["category"][] = ["全校", "班級", "活動", "放假", "評量", "社團"];
const FILTER_CATEGORIES = ["全部", "全校", "班級", "活動", "放假", "評量"] as const;

const categoryColors: Record<string, string> = {
  全校: "bg-primary-soft text-primary",
  班級: "bg-secondary-soft text-secondary",
  活動: "bg-accent-soft text-accent",
  放假: "bg-muted text-muted-foreground",
  評量: "bg-primary-soft text-primary",
  社團: "bg-secondary-soft text-secondary",
};

const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

type FormState = {
  title: string;
  date: string;
  time: string;
  category: SchoolEvent["category"];
  location: string;
  description: string;
  important: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  date: new Date().toISOString().slice(0, 10),
  time: "",
  category: "活動",
  location: "",
  description: "",
  important: false,
});

function getWeekday(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAY_LABELS[d.getDay()] ?? "";
}

function normalizeEvent(item: Record<string, unknown>): CalendarEvent {
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
    weekday: typeof item.weekday === "string" && item.weekday ? item.weekday : getWeekday(date),
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

function getDefaultEvents(): CalendarEvent[] {
  return mockEvents.map((e) => ({ ...e }));
}

function loadInitialEvents(): CalendarEvent[] {
  const stored = loadFromStorage(ADMIN_STORAGE_KEYS.calendarEvents, isSchoolEventArray);
  if (stored) return stored.map(normalizeEvent);
  return getDefaultEvents();
}

function persistEvents(list: CalendarEvent[]) {
  saveToStorage(ADMIN_STORAGE_KEYS.calendarEvents, list);
}

function mergeCloudEvents(rows: CalendarEvent[]): CalendarEvent[] {
  return rows.map((e) => ({
    ...e,
    weekday: e.weekday || getWeekday(e.date),
  }));
}

async function fetchCloudCalendarList(): Promise<CalendarEvent[] | null> {
  if (!isSupabaseConfigured()) return null;
  const raw = await fetchAdminCalendarEvents();
  if (raw === null) return null;
  return mergeCloudEvents(raw);
}

function matchesSearch(item: CalendarEvent, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.location.toLowerCase().includes(q) ||
    (item.note?.toLowerCase().includes(q) ?? false)
  );
}

export default function AdminCalendar() {
  const [list, setList] = useState<CalendarEvent[]>([]);
  const [useCloud, setUseCloud] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("全部");
  const [formOpen, setFormOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CalendarEvent | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          const raw = await fetchAdminCalendarEvents();
          if (cancelled) return;
          if (raw !== null) {
            setUseCloud(true);
            const next = mergeCloudEvents(raw);
            setList(next);
            persistEvents(next);
            setHydrated(true);
            return;
          }
          console.error("[AdminCalendar] fetchAdminCalendarEvents 回傳 null");
          toast.error("雲端資料庫讀取失敗，已改用瀏覽器暫存資料。");
        } catch (e) {
          console.error("[AdminCalendar] 初始載入雲端失敗", e);
          if (!cancelled) toast.error("雲端資料庫讀取失敗，已改用瀏覽器暫存資料。");
        }
      }
      if (!cancelled) {
        setUseCloud(false);
        setList(loadInitialEvents());
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
      .filter((e) => {
        const matchCategory = categoryFilter === "全部" || e.category === categoryFilter;
        const matchSearch = matchesSearch(e, q);
        return matchCategory && matchSearch;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [list, searchQuery, categoryFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (item: CalendarEvent) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      date: item.date,
      time: item.time,
      category: item.category,
      location: item.location,
      description: item.note ?? "",
      important: !!item.important,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("請填寫活動標題");
      return;
    }

    const weekday = getWeekday(form.date);
    const note = form.description.trim() || undefined;
    const writePayload = calendarWriteFromForm({
      title: form.title.trim(),
      date: form.date,
      time: form.time.trim(),
      category: form.category,
      location: form.location.trim(),
      description: form.description.trim(),
      important: form.important,
      isVisible: true,
    });

    const afterSaveClose = () => {
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    };

    const runLocalEdit = (fallbackMsg: string) => {
      if (editingId) {
        const next = list.map((e) =>
          e.id === editingId
            ? {
                ...e,
                title: form.title.trim(),
                date: form.date,
                weekday,
                time: form.time.trim(),
                category: form.category,
                location: form.location.trim(),
                note,
                important: form.important,
              }
            : e,
        );
        setList(next);
        persistEvents(next);
        toast.success(fallbackMsg);
        if (previewItem?.id === editingId) {
          setPreviewItem(next.find((e) => e.id === editingId) ?? null);
        }
      } else {
        const newItem: CalendarEvent = {
          id: `e-${Date.now()}`,
          title: form.title.trim(),
          date: form.date,
          weekday,
          time: form.time.trim(),
          category: form.category,
          location: form.location.trim(),
          audience: "全校",
          note,
          important: form.important,
        };
        const next = [...list, newItem];
        setList(next);
        persistEvents(next);
        toast.success(fallbackMsg);
      }
      afterSaveClose();
    };

    if (useCloud && isSupabaseConfigured()) {
      try {
        if (editingId) {
          const ok = await updateCalendarEvent(editingId, writePayload);
          if (ok) {
            const reloaded = await fetchCloudCalendarList();
            if (reloaded !== null) {
              setList(reloaded);
              persistEvents(reloaded);
              if (previewItem?.id === editingId) {
                const updated = reloaded.find((x) => x.id === editingId);
                if (updated) setPreviewItem(updated);
              }
              toast.success("已更新活動並儲存至雲端");
              afterSaveClose();
              return;
            }
          }
        } else {
          const created = await createCalendarEvent(writePayload);
          if (created?.id) {
            const reloaded = await fetchCloudCalendarList();
            if (reloaded !== null) {
              setList(reloaded);
              persistEvents(reloaded);
              toast.success("已新增活動並儲存至雲端");
              afterSaveClose();
              return;
            }
          }
        }
      } catch (e) {
        console.error("[AdminCalendar] 雲端儲存失敗", e);
      }
      toast.error("雲端資料庫操作失敗，請稍後再試。");
      setUseCloud(false);
      runLocalEdit("已將變更儲存在此瀏覽器（雲端暫無法同步）");
      return;
    }

    if (editingId) {
      const next = list.map((e) =>
        e.id === editingId
          ? {
              ...e,
              title: form.title.trim(),
              date: form.date,
              weekday,
              time: form.time.trim(),
              category: form.category,
              location: form.location.trim(),
              note,
              important: form.important,
            }
          : e,
      );
      setList(next);
      persistEvents(next);
      if (previewItem?.id === editingId) {
        setPreviewItem(next.find((e) => e.id === editingId) ?? null);
      }
      toast.success("已更新活動並儲存在此瀏覽器");
    } else {
      const newItem: CalendarEvent = {
        id: `e-${Date.now()}`,
        title: form.title.trim(),
        date: form.date,
        weekday,
        time: form.time.trim(),
        category: form.category,
        location: form.location.trim(),
        audience: "全校",
        note,
        important: form.important,
      };
      const next = [...list, newItem];
      setList(next);
      persistEvents(next);
      toast.success("已新增活動並儲存在此瀏覽器");
    }

    afterSaveClose();
  };

  const handleDelete = async (item: CalendarEvent) => {
    const ok = window.confirm(`確定要刪除「${item.title}」嗎？此操作無法復原（可使用「恢復預設行事曆」還原 mock 資料）。`);
    if (!ok) return;

    let fallbackFromCloudFailure = false;

    if (useCloud && isSupabaseConfigured()) {
      try {
        const deleted = await deleteCalendarEvent(item.id);
        if (deleted) {
          const reloaded = await fetchCloudCalendarList();
          if (reloaded !== null) {
            setList(reloaded);
            persistEvents(reloaded);
            if (previewItem?.id === item.id) setPreviewItem(null);
            toast.success("已刪除雲端活動");
            return;
          }
        }
      } catch (e) {
        console.error("[AdminCalendar] 雲端刪除失敗", e);
      }
      toast.error("雲端資料庫操作失敗，請稍後再試。");
      setUseCloud(false);
      fallbackFromCloudFailure = true;
    }

    const next = list.filter((e) => e.id !== item.id);
    setList(next);
    persistEvents(next);
    if (previewItem?.id === item.id) setPreviewItem(null);
    toast.success(fallbackFromCloudFailure ? "已從瀏覽器暫存移除活動" : "已刪除活動");
  };

  const handleReset = () => {
    if (useCloud && isSupabaseConfigured()) {
      toast.info("目前使用雲端資料庫，恢復預設功能暫不會清除雲端資料。");
      return;
    }
    const ok = window.confirm("確定要恢復預設行事曆資料嗎？目前瀏覽器中的行事曆修改將全部清除。");
    if (!ok) return;
    clearStorage(ADMIN_STORAGE_KEYS.calendarEvents);
    const defaults = getDefaultEvents();
    setList(defaults);
    setPreviewItem(null);
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    toast.success("已恢復預設行事曆資料");
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">行事曆管理</h2>
        <p className="text-sm text-muted-foreground">資料載入中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">行事曆管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {list.length} 筆活動 · 目前顯示 {filtered.length} 筆
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
            恢復預設行事曆
          </Button>
          <Button className="rounded-xl" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            新增活動
          </Button>
        </div>
      </div>

      <div className="card-base flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋標題、地點或說明…"
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
              <h3 className="font-semibold text-foreground">活動預覽</h3>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 rounded-lg" onClick={() => setPreviewItem(null)}>
              <X className="h-4 w-4" />
              關閉
            </Button>
          </div>
          <div className="space-y-3 p-4">
            <h4 className="text-lg font-bold leading-snug text-foreground">{previewItem.title}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={categoryColors[previewItem.category] ?? "bg-muted"}>
                {previewItem.category}
              </Badge>
              {previewItem.important && (
                <Badge className="bg-accent hover:bg-accent/90">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  重要
                </Badge>
              )}
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">日期</dt>
                <dd>
                  {formatAdminDate(previewItem.date)} · {previewItem.weekday}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">時間</dt>
                <dd>{previewItem.time || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">地點</dt>
                <dd>{previewItem.location || "—"}</dd>
              </div>
              {previewItem.note && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">說明</dt>
                  <dd className="mt-1 whitespace-pre-wrap rounded-xl bg-muted/30 p-3 leading-relaxed">
                    {previewItem.note}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="card-base p-8 text-center text-sm text-muted-foreground">找不到符合條件的活動</p>
        ) : (
          filtered.map((e) => (
            <article
              key={e.id}
              className={`card-base p-4 ${previewItem?.id === e.id ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{e.title}</p>
                    {e.important && (
                      <Badge className="bg-accent hover:bg-accent/90">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        重要
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatAdminDate(e.date)} · {e.weekday} · {e.time || "—"}
                  </p>
                </div>
                <Badge className={categoryColors[e.category] ?? "bg-muted"}>{e.category}</Badge>
              </div>
              <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">地點</dt>
                  <dd>{e.location || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">對象</dt>
                  <dd>{e.audience}</dd>
                </div>
                {e.note && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">說明</dt>
                    <dd className="line-clamp-2">{e.note}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant={previewItem?.id === e.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setPreviewItem(e)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  預覽
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(e)}>
                  <Pencil className="h-3.5 w-3.5" />
                  編輯
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => void handleDelete(e)}
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
            <DialogTitle>{editingId ? "編輯活動" : "新增活動"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="evt-title">標題</Label>
              <Input
                id="evt-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
                placeholder="請輸入活動標題"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="evt-date">日期</Label>
                <Input
                  id="evt-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-time">時間</Label>
                <Input
                  id="evt-time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="rounded-xl"
                  placeholder="例：08:00-10:00"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>分類</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as SchoolEvent["category"] }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evt-location">地點</Label>
                <Input
                  id="evt-location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="rounded-xl"
                  placeholder="例：活動中心"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-description">說明</Label>
              <Textarea
                id="evt-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-[100px] rounded-xl"
                placeholder="活動說明或備註"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={form.important}
                onCheckedChange={(v) => setForm((f) => ({ ...f, important: v === true }))}
              />
              標記為重要
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
