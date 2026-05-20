import { useEffect, useState } from "react";
import { Save, UtensilsCrossed, Leaf, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { todayLunch, todayInfo } from "@/data/mock";
import { toast } from "sonner";
import {
  ADMIN_STORAGE_KEYS,
  clearStorage,
  isAdminTodayLunchForm,
  loadFromStorage,
  lunchFromMock,
  saveToStorage,
  type AdminTodayLunchForm,
} from "@/lib/admin-storage";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  fetchAdminLunchMenuRow,
  fetchLunchMenus,
  upsertLunchMenu,
  type LunchMenuRecord,
  type LunchMenuWriteInput,
} from "@/services/lunchService";

function loadInitialLunch(): AdminTodayLunchForm {
  const stored = loadFromStorage(ADMIN_STORAGE_KEYS.todayLunch, isAdminTodayLunchForm);
  if (stored) return stored;
  return lunchFromMock(todayLunch);
}

function recordToForm(row: LunchMenuRecord): AdminTodayLunchForm {
  return {
    id: row.id,
    date: row.date,
    main: row.main,
    mainDish: row.mainDish,
    sideDish1: row.sideDishes[0] ?? "",
    sideDish2: row.sideDishes[1] ?? "",
    soup: row.soup,
    fruit: row.fruit,
    nutritionNote: row.nutritionNote ?? "",
  };
}

function formToWriteInput(form: AdminTodayLunchForm): LunchMenuWriteInput {
  const date = (form.date && form.date.trim()) || new Date().toISOString().slice(0, 10);
  return {
    date,
    main: form.main,
    mainDish: form.mainDish,
    sideDishes: [form.sideDish1, form.sideDish2].filter(Boolean),
    soup: form.soup,
    fruit: form.fruit,
    nutritionNote: form.nutritionNote?.trim() || undefined,
  };
}

export default function AdminLunch() {
  const [form, setForm] = useState<AdminTodayLunchForm>(() => loadInitialLunch());
  const [useCloud, setUseCloud] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          const menus = await fetchLunchMenus();
          if (cancelled) return;
          if (menus === null) {
            toast.error("雲端資料庫操作失敗，請稍後再試。");
          } else if (menus.length > 0) {
            const row = await fetchAdminLunchMenuRow();
            if (cancelled) return;
            if (row) {
              const next = recordToForm(row);
              setForm(next);
              setUseCloud(true);
              saveToStorage(ADMIN_STORAGE_KEYS.todayLunch, next);
              setHydrated(true);
              return;
            }
          }
        } catch (e) {
          console.error("[AdminLunch] 初始載入雲端失敗", e);
          if (!cancelled) toast.error("雲端資料庫操作失敗，請稍後再試。");
        }
      }
      if (!cancelled) {
        setUseCloud(false);
        setForm(loadInitialLunch());
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sidePreview = [form.sideDish1, form.sideDish2].filter(Boolean).join("、");

  const updateField = <K extends keyof AdminTodayLunchForm>(key: K, value: AdminTodayLunchForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const date = (form.date && form.date.trim()) || new Date().toISOString().slice(0, 10);
    const nextForm: AdminTodayLunchForm = { ...form, date };

    if (useCloud && isSupabaseConfigured()) {
      try {
        const ok = await upsertLunchMenu(formToWriteInput(nextForm));
        if (ok) {
          const row = await fetchAdminLunchMenuRow();
          if (row) {
            const synced = recordToForm(row);
            setForm(synced);
            saveToStorage(ADMIN_STORAGE_KEYS.todayLunch, synced);
            toast.success("已儲存午餐資料至雲端");
            return;
          }
        }
      } catch (e) {
        console.error("[AdminLunch] 雲端儲存失敗", e);
      }
      toast.error("雲端資料庫操作失敗，請稍後再試。");
      saveToStorage(ADMIN_STORAGE_KEYS.todayLunch, nextForm);
      setForm(nextForm);
      setUseCloud(false);
      toast.success("已儲存到此瀏覽器（雲端暫無法同步）");
      return;
    }

    saveToStorage(ADMIN_STORAGE_KEYS.todayLunch, nextForm);
    setForm(nextForm);
    toast.success("已儲存到此瀏覽器，目前尚未連接資料庫。");
  };

  const handleReset = () => {
    if (useCloud && isSupabaseConfigured()) {
      toast.info("目前使用雲端資料庫，恢復預設只適用於瀏覽器暫存模式。");
      return;
    }
    const ok = window.confirm("確定要恢復預設午餐資料嗎？目前瀏覽器中的午餐修改將全部清除。");
    if (!ok) return;
    clearStorage(ADMIN_STORAGE_KEYS.todayLunch);
    setForm(lunchFromMock(todayLunch));
    toast.success("已恢復預設午餐資料");
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">午餐管理</h2>
        <p className="text-sm text-muted-foreground">資料載入中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">午餐管理</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          今日（{todayInfo.date} · {todayInfo.weekday}）· 修改後可即時預覽
        </p>
        <p className="mt-1 text-xs font-medium text-foreground">
          {useCloud && isSupabaseConfigured()
            ? "目前資料來源：Supabase 雲端資料庫"
            : "目前資料來源：此瀏覽器暫存資料"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="card-base space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">編輯今日午餐</h3>
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              恢復預設午餐
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lunch-date">供餐日期</Label>
            <Input
              id="lunch-date"
              type="date"
              value={form.date ?? new Date().toISOString().slice(0, 10)}
              onChange={(e) => updateField("date", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="main">主食</Label>
            <Input
              id="main"
              value={form.main}
              onChange={(e) => updateField("main", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainDish">主菜</Label>
            <Input
              id="mainDish"
              value={form.mainDish}
              onChange={(e) => updateField("mainDish", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sideDish1">副菜一</Label>
              <Input
                id="sideDish1"
                value={form.sideDish1}
                onChange={(e) => updateField("sideDish1", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sideDish2">副菜二</Label>
              <Input
                id="sideDish2"
                value={form.sideDish2}
                onChange={(e) => updateField("sideDish2", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="soup">湯品</Label>
            <Input
              id="soup"
              value={form.soup}
              onChange={(e) => updateField("soup", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fruit">水果</Label>
            <Input
              id="fruit"
              value={form.fruit}
              onChange={(e) => updateField("fruit", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nutritionNote">營養備註</Label>
            <Input
              id="nutritionNote"
              value={form.nutritionNote ?? ""}
              onChange={(e) => updateField("nutritionNote", e.target.value)}
              className="rounded-xl"
              placeholder="選填，對應雲端 nutrition_note"
            />
          </div>
          <Button type="submit" className="w-full rounded-xl">
            <Save className="h-4 w-4" />
            儲存午餐資料
          </Button>
        </form>

        <aside className="space-y-3">
          <h3 className="font-semibold text-foreground">前台預覽卡片</h3>
          <div
            className="card-base overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(150 30% 94%) 0%, hsl(0 0% 100%) 100%)",
            }}
          >
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">今日午餐</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {todayInfo.date} · {todayInfo.weekday}
              </span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-baseline gap-2">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">主食</span>
                <span className="text-sm font-medium">{form.main || "—"}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">主菜</span>
                <span className="text-sm font-medium text-primary">{form.mainDish || "—"}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">副菜</span>
                <span className="text-sm">{sidePreview || "—"}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">湯品</span>
                <span className="text-sm">{form.soup || "—"}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="w-12 shrink-0 text-xs text-muted-foreground">水果</span>
                <span className="text-sm">{form.fruit || "—"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 border-t border-border/40 bg-primary-soft/50 px-4 py-3">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                此為後台即時預覽。若已連接雲端，儲存後前台將優先讀取雲端午餐資料。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
