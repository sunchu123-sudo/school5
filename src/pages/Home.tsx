import { Link } from "react-router-dom";
import {
  Megaphone, CalendarDays, Images, Utensils, ClipboardEdit, Phone,
  ChevronRight, School, Utensils as UtensilsIcon, CalendarCheck, BellRing, Sun,
} from "lucide-react";
import { events, todayHighlights, todayInfo } from "@/data/mock";
import { PublicDataLoading, usePublicData } from "@/lib/dataFallback";
import { getPublicAnnouncements, getPublicTodayLunch } from "@/lib/storage";
import { loadPublicAnnouncements } from "@/services/announcementsService";
import { getFallbackTodayLunch, loadPublicTodayLunch } from "@/services/lunchService";

function formatDateShort(date: string) {
  const m = date.match(/(\d{1,2})月(\d{1,2})日/);
  return m ? `${Number(m[1])}/${Number(m[2])}` : date;
}

function formatWeekdayShort(weekday: string) {
  return weekday.replace("星期", "週");
}

const quickEntries = [
  { to: "/announcements", label: "最新公告", icon: Megaphone, tone: "bg-primary-soft text-primary" },
  { to: "/calendar", label: "行事曆", icon: CalendarDays, tone: "bg-secondary-soft text-secondary" },
  { to: "/albums", label: "校園相簿", icon: Images, tone: "bg-accent-soft text-accent" },
  { to: "/lunch", label: "午餐資訊", icon: Utensils, tone: "bg-primary-soft text-primary" },
  { to: "/leave", label: "學生請假", icon: ClipboardEdit, tone: "bg-secondary-soft text-secondary" },
  { to: "/contact", label: "聯絡學校", icon: Phone, tone: "bg-accent-soft text-accent" },
];

// 山形裝飾 SVG
function MountainDecor() {
  return (
    <svg viewBox="0 0 480 120" className="absolute bottom-0 left-0 w-full h-20 pointer-events-none" preserveAspectRatio="none" aria-hidden>
      <path d="M0,120 L0,80 L80,40 L150,75 L220,30 L310,70 L390,45 L480,75 L480,120 Z" fill="hsl(var(--background))" opacity="0.95" />
      <path d="M0,120 L0,95 L70,70 L160,90 L260,65 L350,88 L430,72 L480,95 L480,120 Z" fill="hsl(var(--background))" />
    </svg>
  );
}

export default function Home() {
  const { data: announcements, loading: announcementsLoading } = usePublicData(
    loadPublicAnnouncements,
    getPublicAnnouncements,
  );
  const { data: todayLunch, loading: lunchLoading } = usePublicData(
    loadPublicTodayLunch,
    getFallbackTodayLunch,
  );
  const latest = announcements.slice(0, 3);
  const upcoming = events.filter((e) => e.date >= "2026-05-18").slice(0, 2);
  const { event: todayEvent } = todayHighlights;
  const lunchSide = `${todayLunch.sideDishes.join("、")} · ${todayLunch.soup} · ${todayLunch.fruit}`;

  return (
    <main className="page-pad pt-0">
      {/* 溫暖歡迎區 */}
      <section className="relative -mx-5 px-5 pt-5 pb-12 overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(150 35% 88%) 0%, hsl(200 55% 92%) 55%, hsl(42 38% 96%) 100%)" }}>
        <div className="absolute top-3 right-5 text-accent/70">
          <Sun size={30} strokeWidth={1.6} />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white grid place-items-center shadow-card">
            <School className="text-primary" size={26} />
          </div>
          <div>
            <div className="text-[10px] tracking-wider text-primary/80 font-semibold">SAN ZHAN ELEMENTARY</div>
            <h1 className="text-[17px] font-bold text-foreground leading-tight mt-0.5">三棧國小行動校園</h1>
          </div>
        </div>
        <div className="relative mt-3">
          <h2 className="text-[18px] font-bold text-foreground leading-snug">歡迎來到三棧國小行動校園</h2>
          <p className="text-[13px] text-muted-foreground mt-1">今日校園資訊一手掌握</p>
        </div>
        <MountainDecor />
      </section>

      {/* 今日重點 - 緊湊版 */}
      {(announcementsLoading || lunchLoading) && (
        <p className="-mt-6 mb-2 text-center text-xs text-muted-foreground">資料載入中…</p>
      )}
      <section className="-mt-8 relative">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-bold flex items-center gap-1.5">
            <CalendarCheck size={18} className="text-primary" /> 今日重點
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {formatDateShort(todayInfo.date)} {formatWeekdayShort(todayInfo.weekday)}
          </span>
        </div>
        <div className="space-y-2">
          <div className="card-base px-3 py-2.5 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
              <UtensilsIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold text-primary shrink-0">今日午餐</span>
                <span className="font-bold text-[15px] truncate">{todayLunch.mainDish}</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{lunchSide}</p>
            </div>
          </div>
          <div className="card-base px-3 py-2.5 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-secondary-soft text-secondary grid place-items-center shrink-0">
              <CalendarCheck size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold text-secondary shrink-0">今日行事</span>
                <span className="font-bold text-[15px] truncate">{todayEvent.title}</span>
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5 truncate">{todayEvent.time} · {todayEvent.audience}</div>
            </div>
          </div>
          <div className="card-base px-3 py-2.5 flex gap-3 items-center border-l-4 border-accent">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center shrink-0">
              <BellRing size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold text-accent shrink-0">重要提醒</span>
                <span className="font-bold text-[15px] truncate">{todayInfo.reminder}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 常用功能 */}
      <section className="mt-6">
        <h2 className="text-[16px] font-bold mb-3">常用功能</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {quickEntries.map(({ to, label, icon: Icon, tone }) => (
            <Link
              key={label}
              to={to}
              className="card-base py-3.5 px-2 flex flex-col items-center justify-center gap-2 text-center active:scale-[0.96] transition-transform"
            >
              <div className={`w-11 h-11 rounded-2xl grid place-items-center ${tone}`}>
                <Icon size={22} />
              </div>
              <span className="font-semibold text-[13px] leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 最新公告 */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold">最新公告</h2>
          <Link to="/announcements" className="text-sm text-primary font-medium flex items-center">
            更多 <ChevronRight size={16} />
          </Link>
        </div>
        <div className="space-y-3">
          {latest.slice(0, 3).map((a) => (
            <Link key={a.id} to={`/announcements/${a.id}`} className="card-base p-4 block active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">{a.category}</span>
                {a.important && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-semibold">重要</span>
                )}
                <span className="text-muted-foreground ml-auto">{a.date.slice(5)}</span>
              </div>
              <h3 className="mt-2 font-semibold text-[15px] leading-snug">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.summary}</p>
            </Link>
          ))}
        </div>
        <Link
          to="/announcements"
          className="mt-3 flex items-center justify-center gap-1 w-full py-3 rounded-2xl bg-primary-soft text-primary font-semibold text-sm active:scale-[0.99] transition-transform"
        >
          查看更多公告 <ChevronRight size={16} />
        </Link>
      </section>

      {/* 近期活動 */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold">近期活動</h2>
          <Link to="/calendar" className="text-sm text-primary font-medium flex items-center">
            行事曆 <ChevronRight size={16} />
          </Link>
        </div>
        <div className="space-y-3">
          {upcoming.map((e) => (
            <div key={e.id} className="card-base p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-soft border border-primary/10 grid place-items-center shrink-0">
                <div className="text-center">
                  <div className="text-[10px] text-muted-foreground leading-none">{e.weekday}</div>
                  <div className="text-xl font-bold text-primary leading-tight mt-0.5">{e.date.slice(8)}</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{e.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{e.time}</div>
                <div className="text-xs text-muted-foreground">📍 {e.location}</div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-semibold shrink-0">{e.category}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        🌿 在山海與文化中 · 學習成長 🌿
      </p>
    </main>
  );
}
