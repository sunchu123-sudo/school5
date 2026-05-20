import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicSchoolInfo, type PublicSchoolInfo } from "@/lib/storage";
import {
  ADMIN_STORAGE_KEYS,
  clearStorage,
  saveToStorage,
} from "@/lib/admin-storage";

type SchoolFormState = PublicSchoolInfo;

function loadInitialForm(): SchoolFormState {
  return getPublicSchoolInfo();
}

export default function AdminSchoolInfo() {
  const [form, setForm] = useState<SchoolFormState>(() => loadInitialForm());

  const updateField = <K extends keyof SchoolFormState>(key: K, value: SchoolFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave: SchoolFormState = {
      ...form,
      phoneTel: form.phone.replace(/\D/g, ""),
    };
    saveToStorage(ADMIN_STORAGE_KEYS.schoolInfo, dataToSave);
    setForm(dataToSave);
    toast.success("已儲存到此瀏覽器，目前尚未連接資料庫。");
  };

  const handleReset = () => {
    const ok = window.confirm("確定要恢復預設學校資料嗎？目前瀏覽器中的修改將全部清除。");
    if (!ok) return;
    clearStorage(ADMIN_STORAGE_KEYS.schoolInfo);
    setForm(getPublicSchoolInfo());
    toast.success("已恢復預設學校資料");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">學校資料</h2>
          <p className="mt-1 text-sm text-muted-foreground">編輯學校基本聯絡資訊與介紹內容</p>
          <p className="mt-1 text-xs text-muted-foreground">
            目前學校資料儲存在此瀏覽器中，尚未連接雲端資料庫。
          </p>
        </div>
        <Button variant="outline" className="shrink-0 rounded-xl" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          恢復預設學校資料
        </Button>
      </div>

      <form className="card-base space-y-4 p-5" onSubmit={handleSave}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">學校名稱</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">電話</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">地址</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="officeHours">上班時間</Label>
            <Input
              id="officeHours"
              value={form.officeHours}
              onChange={(e) => updateField("officeHours", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro">學校簡介</Label>
          <Textarea
            id="intro"
            value={form.intro ?? ""}
            onChange={(e) => updateField("intro", e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vision">學校願景</Label>
          <Textarea
            id="vision"
            value={form.vision ?? ""}
            onChange={(e) => updateField("vision", e.target.value)}
            className="min-h-[100px] rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="transportation">交通資訊（每行一項）</Label>
          <Textarea
            id="transportation"
            value={form.transportation ?? ""}
            onChange={(e) => updateField("transportation", e.target.value)}
            className="min-h-[100px] rounded-xl"
            placeholder="每行輸入一項交通說明"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mapUrl">地圖連結</Label>
          <Input
            id="mapUrl"
            value={form.mapUrl}
            onChange={(e) => updateField("mapUrl", e.target.value)}
            className="rounded-xl"
            placeholder="https://..."
          />
        </div>

        <Button type="submit" className="w-full rounded-xl">
          <Save className="h-4 w-4" />
          儲存學校資料
        </Button>
      </form>
    </div>
  );
}
