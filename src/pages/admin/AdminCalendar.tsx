import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { events } from "@/data/mock";
import { formatAdminDate, showAdminPlaceholder } from "@/lib/admin-ui";

const categoryColors: Record<string, string> = {
  全校: "bg-primary-soft text-primary",
  班級: "bg-secondary-soft text-secondary",
  活動: "bg-accent-soft text-accent",
  放假: "bg-muted text-muted-foreground",
  評量: "bg-primary-soft text-primary",
  社團: "bg-secondary-soft text-secondary",
};

export default function AdminCalendar() {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">行事曆管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">共 {events.length} 筆活動</p>
        </div>
        <Button className="rounded-xl" onClick={() => showAdminPlaceholder("新增活動")}>
          <Plus className="h-4 w-4" />
          新增活動
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.map((e) => (
          <article key={e.id} className="card-base p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{e.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatAdminDate(e.date)} · {e.weekday} · {e.time}
                </p>
              </div>
              <Badge className={categoryColors[e.category] ?? "bg-muted"}>{e.category}</Badge>
            </div>
            <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">地點</dt>
                <dd>{e.location}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">對象</dt>
                <dd>{e.audience}</dd>
              </div>
              {e.note && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">備註</dt>
                  <dd>{e.note}</dd>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
