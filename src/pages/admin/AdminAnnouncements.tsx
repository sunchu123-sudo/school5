import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Search, Pin, X, RotateCcw } from "lucide-react";
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
import {
  announcements as mockAnnouncements,
  type Announcement,
  type AnnouncementCategory,
} from "@/data/mock";
import { formatAdminDate } from "@/lib/admin-ui";
import {
  ADMIN_STORAGE_KEYS,
  clearStorage,
  isAdminAnnouncementArray,
  loadFromStorage,
  saveToStorage,
} from "@/lib/admin-storage";

const ADMIN_CATEGORIES = ["學校公告", "活動通知", "家長通知", "午餐資訊", "其他"] as const;
type AdminCategory = (typeof ADMIN_CATEGORIES)[number];

type AdminAnnouncement = Omit<Announcement, "category"> & {
  category: AdminCategory;
  pinned?: boolean;
};

type FormState = {
  title: string;
  date: string;
  category: AdminCategory;
  content: string;
  important: boolean;
  pinned: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  date: new Date().toISOString().slice(0, 10),
  category: "學校公告",
  content: "",
  important: false,
  pinned: false,
});

function mapMockCategory(cat: AnnouncementCategory): AdminCategory {
  const map: Record<AnnouncementCategory, AdminCategory> = {
    行政公告: "學校公告",
    班級通知: "家長通知",
    活動通知: "活動通知",
    午餐健康: "午餐資訊",
    榮譽榜: "學校公告",
    緊急通知: "學校公告",
  };
  return map[cat] ?? "其他";
}

function toAdminList(items: Announcement[]): AdminAnnouncement[] {
  return items.map((a) => ({
    ...a,
    category: mapMockCategory(a.category),
    pinned: false,
  }));
}

function sortAnnouncements(list: AdminAnnouncement[]) {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}

function getDefaultAnnouncements(): AdminAnnouncement[] {
  return toAdminList(mockAnnouncements);
}

function loadInitialAnnouncements(): AdminAnnouncement[] {
  const stored = loadFromStorage(ADMIN_STORAGE_KEYS.announcements, isAdminAnnouncementArray);
  if (stored) return stored as AdminAnnouncement[];
  return getDefaultAnnouncements();
}

function persistAnnouncements(list: AdminAnnouncement[]) {
  saveToStorage(ADMIN_STORAGE_KEYS.announcements, list);
}

function matchesSearch(item: AdminAnnouncement, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
}

export default function AdminAnnouncements() {
  const [list, setList] = useState<AdminAnnouncement[]>(() => loadInitialAnnouncements());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("全部");
  const [formOpen, setFormOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<AdminAnnouncement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    return sortAnnouncements(
      list.filter((a) => {
        const matchSearch = matchesSearch(a, q);
        const matchCategory = categoryFilter === "全部" || a.category === categoryFilter;
        return matchSearch && matchCategory;
      }),
    );
  }, [list, searchQuery, categoryFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (item: AdminAnnouncement) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      date: item.date,
      category: item.category,
      content: item.content,
      important: !!item.important,
      pinned: !!item.pinned,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("請填寫公告標題");
      return;
    }
    if (!form.content.trim()) {
      toast.error("請填寫公告內容");
      return;
    }

    const summary = form.content.trim().slice(0, 80);

    if (editingId) {
      const next = list.map((a) =>
        a.id === editingId
          ? {
              ...a,
              title: form.title.trim(),
              date: form.date,
              category: form.category,
              content: form.content.trim(),
              summary,
              important: form.important,
              pinned: form.pinned,
            }
          : a,
      );
      setList(next);
      persistAnnouncements(next);
      if (previewItem?.id === editingId) {
        setPreviewItem((prev) =>
          prev
            ? {
                ...prev,
                title: form.title.trim(),
                date: form.date,
                category: form.category,
                content: form.content.trim(),
                summary,
                important: form.important,
                pinned: form.pinned,
              }
            : null,
        );
      }
      toast.success("已更新公告");
    } else {
      const newItem: AdminAnnouncement = {
        id: `a-${Date.now()}`,
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        content: form.content.trim(),
        summary,
        important: form.important,
        pinned: form.pinned,
      };
      const next = [...list, newItem];
      setList(next);
      persistAnnouncements(next);
      toast.success("已新增公告");
    }

    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleDelete = (item: AdminAnnouncement) => {
    const ok = window.confirm(`確定要刪除「${item.title}」嗎？此操作無法復原（可使用「恢復預設公告」還原 mock 資料）。`);
    if (!ok) return;
    const next = list.filter((a) => a.id !== item.id);
    setList(next);
    persistAnnouncements(next);
    if (previewItem?.id === item.id) setPreviewItem(null);
    toast.success("已刪除公告");
  };

  const handleReset = () => {
    const ok = window.confirm("確定要恢復預設公告資料嗎？目前瀏覽器中的公告修改將全部清除。");
    if (!ok) return;
    clearStorage(ADMIN_STORAGE_KEYS.announcements);
    const defaults = getDefaultAnnouncements();
    setList(defaults);
    setPreviewItem(null);
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    toast.success("已恢復預設公告資料");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">公告管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {list.length} 則公告 · 目前顯示 {filtered.length} 則
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            目前資料儲存在此瀏覽器中，尚未連接雲端資料庫。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            恢復預設公告
          </Button>
          <Button className="rounded-xl" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            新增公告
          </Button>
        </div>
      </div>

      <div className="card-base flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋公告標題或內容…"
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
            <SelectItem value="全部">全部</SelectItem>
            {ADMIN_CATEGORIES.map((c) => (
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
              <h3 className="font-semibold text-foreground">公告預覽</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 rounded-lg"
              onClick={() => setPreviewItem(null)}
            >
              <X className="h-4 w-4" />
              關閉
            </Button>
          </div>
          <div className="space-y-3 p-4">
            <h4 className="text-lg font-bold leading-snug text-foreground">{previewItem.title}</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{previewItem.category}</Badge>
              {previewItem.important && <Badge className="bg-accent hover:bg-accent/90">重要</Badge>}
              {previewItem.pinned && (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  置頂
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">{formatAdminDate(previewItem.date)}</span>
            </div>
            <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {previewItem.content}
            </div>
          </div>
        </section>
      )}

      <div className="card-base overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">找不到符合條件的公告</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">標題</th>
                    <th className="px-4 py-3 font-medium">日期</th>
                    <th className="px-4 py-3 font-medium">分類</th>
                    <th className="px-4 py-3 font-medium">重要</th>
                    <th className="px-4 py-3 font-medium">置頂</th>
                    <th className="px-4 py-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      className={`border-b border-border/40 last:border-0 hover:bg-muted/20 ${
                        previewItem?.id === a.id ? "bg-primary-soft/30" : ""
                      }`}
                    >
                      <td className="max-w-[220px] truncate px-4 py-3 font-medium">
                        <span className="flex items-center gap-1.5">
                          {a.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="置頂" />}
                          {a.title}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatAdminDate(a.date)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="font-normal">
                          {a.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {a.important ? (
                          <Badge className="bg-accent hover:bg-accent/90">重要</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.pinned ? (
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            置頂
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant={previewItem?.id === a.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setPreviewItem(a)}
                          >
                            <Eye className="h-4 w-4" />
                            預覽
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                            <Pencil className="h-4 w-4" />
                            編輯
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(a)}
                          >
                            <Trash2 className="h-4 w-4" />
                            刪除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-border/40 md:hidden">
              {filtered.map((a) => (
                <li
                  key={a.id}
                  className={`p-4 ${previewItem?.id === a.id ? "bg-primary-soft/30" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                    <p className="font-medium">{a.title}</p>
                    {a.important && <Badge className="bg-accent hover:bg-accent/90">重要</Badge>}
                    {a.pinned && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        置頂
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatAdminDate(a.date)} · {a.category}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant={previewItem?.id === a.id ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setPreviewItem(a)}
                    >
                      預覽
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                      編輯
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(a)}
                    >
                      刪除
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯公告" : "新增公告"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ann-title">標題</Label>
              <Input
                id="ann-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
                placeholder="請輸入公告標題"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ann-date">日期</Label>
                <Input
                  id="ann-date"
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
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as AdminCategory }))}
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
              <Label htmlFor="ann-content">內容</Label>
              <Textarea
                id="ann-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="min-h-[140px] rounded-xl"
                placeholder="請輸入公告內容"
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={form.important}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, important: v === true }))}
                />
                標記為重要
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={form.pinned}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, pinned: v === true }))}
                />
                置頂顯示
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setFormOpen(false)}>
              取消
            </Button>
            <Button className="rounded-xl" onClick={handleSave}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
