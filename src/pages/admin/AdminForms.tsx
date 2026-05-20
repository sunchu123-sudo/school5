import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadForms } from "@/data/mock";
import { showAdminPlaceholder } from "@/lib/admin-ui";

const formCategories: Record<string, string> = {
  f1: "請假",
  f2: "活動",
  f3: "獎助",
  f4: "行政",
  f5: "志工",
};

export default function AdminForms() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">表單管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">共 {downloadForms.length} 份表單</p>
        </div>
        <Button className="rounded-xl" onClick={() => showAdminPlaceholder("新增表單")}>
          <Plus className="h-4 w-4" />
          新增表單
        </Button>
      </div>

      <ul className="space-y-3">
        {downloadForms.map((f) => (
          <li key={f.id} className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{f.title}</p>
                <Badge variant="secondary" className="font-normal">
                  {formCategories[f.id] ?? "一般"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => showAdminPlaceholder("編輯表單")}>
                <Pencil className="h-3.5 w-3.5" />
                編輯
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => showAdminPlaceholder("刪除表單")}
              >
                <Trash2 className="h-3.5 w-3.5" />
                刪除
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
