import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye, Search, X, RotateCcw, EyeOff } from "lucide-react";
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
import { downloadForms as mockDownloadForms } from "@/data/mock";
import {
  ADMIN_STORAGE_KEYS,
  clearStorage,
  isAdminFormArray,
  loadFromStorage,
  saveToStorage,
} from "@/lib/admin-storage";

type AdminForm = {
  id: string;
  title: string;
  category: AdminFormCategory;
  description: string;
  fileUrl: string;
  isVisible: boolean;
};

const FORM_CATEGORIES = ["請假", "校外教學", "獎助學金", "學生資料", "家長志工", "其他"] as const;
type AdminFormCategory = (typeof FORM_CATEGORIES)[number];
const FILTER_CATEGORIES = ["全部", ...FORM_CATEGORIES] as const;

const MOCK_FORM_CATEGORY: Record<string, AdminFormCategory> = {
  f1: "請假",
  f2: "校外教學",
  f3: "獎助學金",
  f4: "學生資料",
  f5: "家長志工",
};

type FormState = {
  title: string;
  category: AdminFormCategory;
  description: string;
  fileUrl: string;
  isVisible: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  category: "請假",
  description: "",
  fileUrl: "",
  isVisible: true,
});

function normalizeForm(item: Record<string, unknown>): AdminForm {
  const description =
    typeof item.description === "string"
      ? item.description
      : typeof item.desc === "string"
        ? item.desc
        : "";

  return {
    id: String(item.id),
    title: String(item.title),
    category: (FORM_CATEGORIES.includes(item.category as AdminFormCategory)
      ? item.category
      : "其他") as AdminFormCategory,
    description,
    fileUrl: typeof item.fileUrl === "string" ? item.fileUrl : "",
    isVisible: item.isVisible !== false,
  };
}

function getDefaultForms(): AdminForm[] {
  return mockDownloadForms.map((f) => ({
    id: f.id,
    title: f.title,
    category: MOCK_FORM_CATEGORY[f.id] ?? "其他",
    description: f.desc,
    fileUrl: "",
    isVisible: true,
  }));
}

function loadInitialForms(): AdminForm[] {
  const stored = loadFromStorage(ADMIN_STORAGE_KEYS.forms, isAdminFormArray);
  if (stored) return stored.map(normalizeForm);
  return getDefaultForms();
}

function persistForms(list: AdminForm[]) {
  saveToStorage(ADMIN_STORAGE_KEYS.forms, list);
}

function matchesSearch(item: AdminForm, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.title.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q)
  );
}

export default function AdminForms() {
  const [list, setList] = useState<AdminForm[]>(() => loadInitialForms());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("全部");
  const [formOpen, setFormOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<AdminForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    return list.filter((f) => {
      const matchCategory = categoryFilter === "全部" || f.category === categoryFilter;
      const matchSearch = matchesSearch(f, q);
      return matchCategory && matchSearch;
    });
  }, [list, searchQuery, categoryFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (item: AdminForm) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      description: item.description,
      fileUrl: item.fileUrl,
      isVisible: item.isVisible,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("請填寫表單名稱");
      return;
    }

    if (editingId) {
      const next = list.map((f) =>
        f.id === editingId
          ? {
              ...f,
              title: form.title.trim(),
              category: form.category,
              description: form.description.trim(),
              fileUrl: form.fileUrl.trim(),
              isVisible: form.isVisible,
            }
          : f,
      );
      setList(next);
      persistForms(next);
      if (previewItem?.id === editingId) {
        setPreviewItem(next.find((f) => f.id === editingId) ?? null);
      }
      toast.success("已更新表單");
    } else {
      const newItem: AdminForm = {
        id: `f-${Date.now()}`,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        fileUrl: form.fileUrl.trim(),
        isVisible: form.isVisible,
      };
      const next = [...list, newItem];
      setList(next);
      persistForms(next);
      toast.success("已新增表單");
    }

    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleDelete = (item: AdminForm) => {
    const ok = window.confirm(`確定要刪除「${item.title}」嗎？此操作無法復原（可使用「恢復預設表單」還原 mock 資料）。`);
    if (!ok) return;
    const next = list.filter((f) => f.id !== item.id);
    setList(next);
    persistForms(next);
    if (previewItem?.id === item.id) setPreviewItem(null);
    toast.success("已刪除表單");
  };

  const handleReset = () => {
    const ok = window.confirm("確定要恢復預設表單資料嗎？目前瀏覽器中的表單修改將全部清除。");
    if (!ok) return;
    clearStorage(ADMIN_STORAGE_KEYS.forms);
    const defaults = getDefaultForms();
    setList(defaults);
    setPreviewItem(null);
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    toast.success("已恢復預設表單資料");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">表單管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {list.length} 份表單 · 目前顯示 {filtered.length} 份
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            目前表單資料儲存在此瀏覽器中，尚未連接雲端資料庫。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            恢復預設表單
          </Button>
          <Button className="rounded-xl" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            新增表單
          </Button>
        </div>
      </div>

      <div className="card-base flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜尋表單名稱、分類或說明…"
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
              <h3 className="font-semibold text-foreground">表單預覽</h3>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 rounded-lg" onClick={() => setPreviewItem(null)}>
              <X className="h-4 w-4" />
              關閉
            </Button>
          </div>
          <div className="space-y-3 p-4">
            <h4 className="text-lg font-bold">{previewItem.title}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{previewItem.category}</Badge>
              {previewItem.isVisible ? (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  前台顯示
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <EyeOff className="mr-1 h-3 w-3" />
                  前台隱藏
                </Badge>
              )}
            </div>
            {previewItem.description && (
              <p className="text-sm leading-relaxed text-foreground">{previewItem.description}</p>
            )}
            {previewItem.fileUrl ? (
              <p className="text-sm text-muted-foreground break-all">檔案連結：{previewItem.fileUrl}</p>
            ) : (
              <p className="text-sm text-muted-foreground">尚未設定檔案連結</p>
            )}
          </div>
        </section>
      )}

      <ul className="space-y-3">
        {filtered.length === 0 ? (
          <li className="card-base p-8 text-center text-sm text-muted-foreground">找不到符合條件的表單</li>
        ) : (
          filtered.map((f) => (
            <li
              key={f.id}
              className={`card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                previewItem?.id === f.id ? "ring-2 ring-primary/30" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{f.title}</p>
                  <Badge variant="secondary" className="font-normal">
                    {f.category}
                  </Badge>
                  {f.isVisible ? (
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      前台顯示
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      前台隱藏
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{f.description || "—"}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  variant={previewItem?.id === f.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setPreviewItem(f)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  預覽
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(f)}>
                  <Pencil className="h-3.5 w-3.5" />
                  編輯
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(f)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  刪除
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯表單" : "新增表單"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="form-title">表單名稱</Label>
              <Input
                id="form-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
                placeholder="請輸入表單名稱"
              />
            </div>
            <div className="space-y-2">
              <Label>分類</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as AdminFormCategory }))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORM_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-description">說明</Label>
              <Textarea
                id="form-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-[80px] rounded-xl"
                placeholder="表單用途說明"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-fileUrl">檔案連結</Label>
              <Input
                id="form-fileUrl"
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                className="rounded-xl"
                placeholder="https://... 或 /files/form.pdf"
              />
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
            <Button className="rounded-xl" onClick={handleSave}>
              儲存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
