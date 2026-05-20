import { Info, Database, LogIn, FileCode2, AppWindow } from "lucide-react";

const infoItems = [
  { icon: AppWindow, label: "系統名稱", value: "三棧國小行動校園 App" },
  { icon: Info, label: "版本", value: "v0.1 後台骨架版" },
  { icon: FileCode2, label: "資料來源", value: "mock.ts" },
  { icon: LogIn, label: "登入功能", value: "尚未啟用" },
  { icon: Database, label: "資料庫", value: "尚未連接" },
];

export default function AdminSettings() {
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

      <p className="text-center text-xs text-muted-foreground">
        後台管理功能 v0.1 為骨架版本，後續可串接登入驗證與資料庫。
      </p>
    </div>
  );
}
