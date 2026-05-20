import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  Utensils,
  Images,
  School,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "首頁", icon: LayoutDashboard, end: true },
  { to: "/admin/announcements", label: "公告管理", icon: Megaphone },
  { to: "/admin/calendar", label: "行事曆", icon: CalendarDays },
  { to: "/admin/lunch", label: "午餐管理", icon: Utensils },
  { to: "/admin/albums", label: "相簿管理", icon: Images },
  { to: "/admin/school", label: "學校資料", icon: School },
  { to: "/admin/forms", label: "表單管理", icon: FileText },
  { to: "/admin/settings", label: "系統設定", icon: Settings },
];

export default function AdminNav() {
  return (
    <nav
      className="border-b border-border/60 bg-card/80 md:w-52 md:shrink-0 md:border-b-0 md:border-r"
      aria-label="後台導覽"
    >
      <ul className="flex gap-1 overflow-x-auto p-2 scrollbar-none md:flex-col md:overflow-visible md:p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="shrink-0 md:shrink">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-primary-soft hover:text-primary",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
