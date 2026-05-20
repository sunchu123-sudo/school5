import { useRef } from "react";
import {
  Info,
  Database,
  LogIn,
  FileCode2,
  AppWindow,
  Download,
  Upload,
  Trash2,
  HardDriveDownload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  clearAllBackupData,
  downloadBackup,
  importBackupFromFile,
  isLocalStorageAvailable,
} from "@/lib/adminBackup";

const infoItems = [
  { icon: AppWindow, label: "系統名稱", value: "三棧國小行動校園 App" },
  { icon: Info, label: "版本", value: "v0.1 後台骨架版" },
  { icon: FileCode2, label: "資料來源", value: "mock.ts" },
  { icon: LogIn, label: "登入功能", value: "尚未啟用" },
  { icon: Database, label: "資料庫", value: "尚未連接" },
];

export default function AdminSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageAvailable = isLocalStorageAvailable();

  const handleExport = () => {
    const result = downloadBackup();
    if (result.ok) {
      toast.success("已匯出備份檔");
    } else {
      toast.error(result.error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const confirmed = window.confirm("匯入後會覆蓋目前瀏覽器中的後台資料，確定要繼續嗎？");
    if (!confirmed) return;

    const result = await importBackupFromFile(file);
    if (result.ok) {
      toast.success("已匯入備份資料，請重新整理頁面查看最新內容。");
    } else {
      toast.error(result.error);
    }
  };

  const handleClear = () => {
    const confirmed = window.confirm("這會清除目前瀏覽器中的所有後台暫存資料，確定要繼續嗎？");
    if (!confirmed) return;

    const result = clearAllBackupData();
    if (result.ok) {
      toast.success("已清除所有後台暫存資料，前台將回到預設資料。");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">系統設定</h2>
        <p className="mt-1 text-sm text-muted-foreground">後台系統資訊與狀態</p>
      </div>

      <ul className="card-base divide-y divide-border/40">
        {infoItems.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="card-base space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <HardDriveDownload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">資料備份與還原</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              目前系統資料儲存在此瀏覽器中。建議定期匯出 JSON 備份檔，避免清除瀏覽器資料後遺失。
            </p>
          </div>
        </div>

        {!storageAvailable && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            目前無法使用瀏覽器暫存空間，備份與還原功能可能無法正常運作。請確認未使用私密瀏覽模式，或儲存空間是否已滿。
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="rounded-xl"
            disabled={!storageAvailable}
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            匯出備份檔
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={!storageAvailable}
            onClick={handleImportClick}
          >
            <Upload className="h-4 w-4" />
            匯入備份檔
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            disabled={!storageAvailable}
            onClick={handleClear}
          >
            <Trash2 className="h-4 w-4" />
            清除所有暫存資料
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            此操作會清除公告、行事曆、午餐、相簿、學校資料與表單的暫存內容，無法復原。
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        後台管理功能 v0.1 為骨架版本，後續可串接登入驗證與資料庫。
      </p>
    </div>
  );
}
