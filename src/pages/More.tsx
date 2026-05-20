import { Link } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { moreGroups, moreItemRoutes } from "@/data/mock";
import {
  School, Users, MapPin, Map, ClipboardEdit, MessagesSquare, FileDown,
  GraduationCap, BookOpen, PlayCircle, Utensils, HeartPulse, PhoneCall,
  Settings, Info, ChevronRight, LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, LucideIcon> = {
  School, Users, MapPin, Map, ClipboardEdit, MessagesSquare, FileDown,
  GraduationCap, BookOpen, PlayCircle, Utensils, HeartPulse, PhoneCall,
  Settings, Info,
};

export default function More() {
  return (
    <main className="pb-28">
      <PageHeader title="更多" subtitle="學校資訊與各項服務" />

      <div className="px-5 pt-5 space-y-5">
        {moreGroups.map((g) => (
          <section key={g.id}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-1 h-4 rounded-full bg-primary" />
              <h2 className="text-[15px] font-bold text-foreground">{g.title}</h2>
            </div>
            <div className="card-base divide-y divide-border/60 overflow-hidden">
              {g.items.map((it) => {
                const Icon = iconMap[it.icon] ?? Info;
                const route = moreItemRoutes[it.id];
                const inner = (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-semibold text-[15px] leading-tight">{it.title}</div>
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">{it.subtitle}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                  </>
                );
                const className =
                  "w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-muted/60 transition";

                if (route) {
                  return (
                    <Link
                      key={it.id}
                      to={route}
                      state={{ from: "/more" }}
                      className={className}
                    >
                      {inner}
                    </Link>
                  );
                }

                return (
                  <button
                    key={it.id}
                    type="button"
                    className={className}
                    onClick={() =>
                      toast.info("功能開發中", { description: `「${it.title}」即將上線，敬請期待。` })
                    }
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <p className="text-center text-xs text-muted-foreground pt-2">三棧國小行動校園 · v1.0.0</p>
      </div>
    </main>
  );
}
