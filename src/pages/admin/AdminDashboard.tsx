import { Link } from "react-router-dom";
import {
  Megaphone,
  CalendarDays,
  Images,
  FileText,
  Utensils,
  School,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  announcements,
  events,
  albums,
  downloadForms,
  todayLunch,
  todayInfo,
} from "@/data/mock";
import { formatAdminDate } from "@/lib/admin-ui";

const quickLinks = [
  { to: "/admin/announcements", label: "公告管理", icon: Megaphone, tone: "bg-primary-soft text-primary" },
  { to: "/admin/calendar", label: "行事曆管理", icon: CalendarDays, tone: "bg-secondary-soft text-secondary" },
  { to: "/admin/lunch", label: "午餐管理", icon: Utensils, tone: "bg-accent-soft text-accent" },
  { to: "/admin/school", label: "學校資料", icon: School, tone: "bg-primary-soft text-primary" },
];

export default function AdminDashboard() {
  const recentAnnouncements = announcements.slice(0, 3);
  const upcomingEvents = events
    .filter((e) => e.date >= "2026-05-18")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const lunchSide = todayLunch.sideDishes.join("、");

  const stats = [
    { label: "公告", value: announcements.length, icon: Megaphone },
    { label: "活動", value: events.length, icon: CalendarDays },
    { label: "相簿", value: albums.length, icon: Images },
    { label: "表單", value: downloadForms.length, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">後台管理首頁</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {todayInfo.date}（{todayInfo.weekday}）· 資料來源 mock.ts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-base p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <section className="card-base p-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-accent" />
          <h3 className="font-semibold text-foreground">今日午餐摘要</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          <span className="font-medium">{todayLunch.main}</span>
          {" · "}
          {todayLunch.mainDish}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          副菜：{lunchSide} · 湯品：{todayLunch.soup} · 水果：{todayLunch.fruit}
        </p>
        <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
          <Link to="/admin/lunch">
            編輯今日午餐
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">快捷管理</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {quickLinks.map(({ to, label, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className="card-base flex items-center gap-3 p-3 transition-shadow hover:shadow-elevated"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card-base p-4">
          <h3 className="font-semibold text-foreground">最近公告</h3>
          <ul className="mt-3 space-y-2">
            {recentAnnouncements.map((a) => (
              <li key={a.id} className="flex items-start gap-2 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                {a.important && (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-label="重要" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAdminDate(a.date)} · {a.category}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
            <Link to="/admin/announcements">查看全部公告</Link>
          </Button>
        </section>

        <section className="card-base p-4">
          <h3 className="font-semibold text-foreground">近期活動</h3>
          <ul className="mt-3 space-y-2">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatAdminDate(e.date)} {e.weekday} · {e.time} · {e.location}
                </p>
              </li>
            ))}
          </ul>
          <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
            <Link to="/admin/calendar">查看全部活動</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
