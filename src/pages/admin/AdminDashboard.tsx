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
  Pin,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { todayInfo } from "@/data/mock";
import { formatAdminDate } from "@/lib/admin-ui";
import {
  getAdminAnnouncements,
  getAdminAlbums,
  getAdminForms,
  getPublicCalendarEvents,
  getPublicTodayLunch,
} from "@/lib/storage";

const quickLinks = [
  { to: "/admin/announcements", label: "公告管理", icon: Megaphone, tone: "bg-primary-soft text-primary" },
  { to: "/admin/calendar", label: "行事曆管理", icon: CalendarDays, tone: "bg-secondary-soft text-secondary" },
  { to: "/admin/lunch", label: "午餐管理", icon: Utensils, tone: "bg-accent-soft text-accent" },
  { to: "/admin/school", label: "學校資料", icon: School, tone: "bg-primary-soft text-primary" },
];

export default function AdminDashboard() {
  const announcements = getAdminAnnouncements();
  const events = getPublicCalendarEvents();
  const albums = getAdminAlbums();
  const forms = getAdminForms();
  const todayLunch = getPublicTodayLunch();

  const visibleAlbums = albums.filter((a) => a.isVisible !== false);
  const visibleForms = forms.filter((f) => f.isVisible !== false);

  const recentAnnouncements = announcements.slice(0, 3);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const sidePreview = todayLunch.sideDishes.join("、");

  const stats = [
    { label: "公告", value: announcements.length, sub: null, icon: Megaphone },
    { label: "活動", value: events.length, sub: null, icon: CalendarDays },
    {
      label: "相簿",
      value: albums.length,
      sub: `前台顯示 ${visibleAlbums.length} 本`,
      icon: Images,
    },
    {
      label: "表單",
      value: forms.length,
      sub: `前台顯示 ${visibleForms.length} 份`,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">後台管理首頁</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {todayInfo.date}（{todayInfo.weekday}）· 資料來源：瀏覽器暫存
        </p>
      </div>

      <div className="card-base flex items-start gap-3 border-l-4 border-l-primary bg-primary-soft/30 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground/90">
          目前系統使用瀏覽器暫存資料，尚未連接雲端資料庫。若更換裝置或清除瀏覽器資料，暫存內容將會消失。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="card-base p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{value}</p>
            {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>

      <section className="card-base p-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-accent" />
          <h3 className="font-semibold text-foreground">今日午餐摘要</h3>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-muted-foreground">主食</dt>
            <dd className="font-medium">{todayLunch.main || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-muted-foreground">主菜</dt>
            <dd className="font-medium">{todayLunch.mainDish || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-muted-foreground">副菜</dt>
            <dd>{sidePreview || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-muted-foreground">湯品</dt>
            <dd>{todayLunch.soup || "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-muted-foreground">水果</dt>
            <dd>{todayLunch.fruit || "—"}</dd>
          </div>
        </dl>
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
            {recentAnnouncements.length === 0 ? (
              <li className="text-sm text-muted-foreground">目前沒有公告</li>
            ) : (
              recentAnnouncements.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2 border-b border-border/40 pb-2 last:border-0 last:pb-0"
                >
                  <div className="mt-0.5 flex shrink-0 gap-1">
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-primary" aria-label="置頂" />}
                    {a.important && (
                      <AlertCircle className="h-3.5 w-3.5 text-accent" aria-label="重要" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      {a.pinned && (
                        <Badge variant="outline" className="h-5 border-primary/40 px-1.5 text-[10px] text-primary">
                          置頂
                        </Badge>
                      )}
                      {a.important && (
                        <Badge className="h-5 bg-accent px-1.5 text-[10px] hover:bg-accent/90">重要</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatAdminDate(a.date)} · {a.category}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
            <Link to="/admin/announcements">查看全部公告</Link>
          </Button>
        </section>

        <section className="card-base p-4">
          <h3 className="font-semibold text-foreground">近期活動</h3>
          <ul className="mt-3 space-y-2">
            {upcomingEvents.length === 0 ? (
              <li className="text-sm text-muted-foreground">目前沒有近期活動</li>
            ) : (
              upcomingEvents.map((e) => (
                <li key={e.id} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium">{e.title}</p>
                    {e.important && (
                      <Badge className="h-5 bg-accent px-1.5 text-[10px] hover:bg-accent/90">重要</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatAdminDate(e.date)} {e.weekday} · {e.time} · {e.location}
                  </p>
                </li>
              ))
            )}
          </ul>
          <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
            <Link to="/admin/calendar">查看全部活動</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
