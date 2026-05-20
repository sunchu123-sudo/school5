import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { events, SchoolEvent } from "@/data/mock";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Users } from "lucide-react";

const cats = ["全部", "全校", "班級", "活動", "放假", "評量", "社團"] as const;
const today = "2026-05-18";

function EventCard({ e }: { e: SchoolEvent }) {
  const tone: Record<SchoolEvent["category"], string> = {
    全校: "bg-primary-soft text-primary",
    班級: "bg-secondary-soft text-secondary",
    活動: "bg-accent-soft text-accent",
    放假: "bg-destructive/10 text-destructive",
    評量: "bg-muted text-foreground",
    社團: "bg-secondary-soft text-secondary",
  };
  return (
    <div className="card-base p-4 flex gap-3 items-stretch">
      <div className="w-14 text-center shrink-0 flex flex-col justify-center bg-gradient-soft rounded-xl py-2 border border-primary/10">
        <div className="text-[11px] text-muted-foreground leading-none">{e.weekday}</div>
        <div className="text-2xl font-bold text-primary leading-none mt-1">{e.date.slice(8)}</div>
        <div className="text-[10px] text-muted-foreground leading-none mt-1">{e.date.slice(5, 7)}月</div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[15px] truncate flex-1">{e.title}</h3>
          <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0", tone[e.category])}>{e.category}</span>
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground grid gap-1">
          <div className="flex items-center gap-1.5"><Clock size={12} className="shrink-0" /> <span className="truncate">{e.time}</span></div>
          <div className="flex items-center gap-1.5"><MapPin size={12} className="shrink-0" /> <span className="truncate">{e.location}</span></div>
          <div className="flex items-center gap-1.5"><Users size={12} className="shrink-0" /> <span className="truncate">{e.audience}</span></div>
        </div>
        {e.note && (
          <span className="mt-2 self-start text-[11px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold">
            ※ {e.note}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [cat, setCat] = useState<(typeof cats)[number]>("全部");
  const filter = (list: SchoolEvent[]) => cat === "全部" ? list : list.filter((e) => e.category === cat);

  const todayE = filter(events.filter((e) => e.date === today));
  const week = filter(events.filter((e) => e.date >= "2026-05-18" && e.date <= "2026-05-24"));
  const month = filter(events.filter((e) => e.date.startsWith("2026-05") || e.date.startsWith("2026-06") || e.date.startsWith("2026-07")));

  return (
    <main className="pb-28">
      <PageHeader title="行事曆" subtitle="掌握本週與本月活動" />

      <div className="pt-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 w-max px-5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "min-w-[64px] h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center transition",
                cat === c ? "bg-primary text-primary-foreground shadow-card" : "bg-card border border-border text-muted-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="px-5 mt-5">
        <h2 className="text-base font-bold mb-3">今日活動</h2>
        {todayE.length ? (
          <div className="space-y-3">{todayE.map((e) => <EventCard key={e.id} e={e} />)}</div>
        ) : (
          <div className="card-base p-5 text-center text-sm text-muted-foreground">今日無活動</div>
        )}
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">本週行事</h2>
        <div className="space-y-3">{week.map((e) => <EventCard key={e.id} e={e} />)}</div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">本月重要活動</h2>
        <div className="space-y-3">{month.map((e) => <EventCard key={e.id} e={e} />)}</div>
      </section>
    </main>
  );
}
