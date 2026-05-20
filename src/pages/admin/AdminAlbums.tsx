import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { albums } from "@/data/mock";
import { formatAdminDate, showAdminPlaceholder } from "@/lib/admin-ui";

export default function AdminAlbums() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">相簿管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">共 {albums.length} 本相簿</p>
        </div>
        <Button className="rounded-xl" onClick={() => showAdminPlaceholder("新增相簿")}>
          <Plus className="h-4 w-4" />
          新增相簿
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {albums.map((al) => (
          <article key={al.id} className="card-base p-4">
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img src={al.coverImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{al.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatAdminDate(al.date)} · {al.photoCount} 張
                </p>
                <Badge variant="secondary" className="mt-2 font-normal">
                  {al.category}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => showAdminPlaceholder("編輯相簿")}>
                <Pencil className="h-3.5 w-3.5" />
                編輯
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => showAdminPlaceholder("刪除相簿")}
              >
                <Trash2 className="h-3.5 w-3.5" />
                刪除
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
