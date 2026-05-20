import { Link, useLocation } from "react-router-dom";
import { Home, Megaphone, CalendarDays, Images, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    to: "/",
    label: "首頁",
    icon: Home,
    activePaths: ["/", "/lunch"],
  },
  {
    to: "/announcements",
    label: "公告",
    icon: Megaphone,
    activePrefixes: ["/announcements"],
  },
  {
    to: "/calendar",
    label: "行事曆",
    icon: CalendarDays,
    activePaths: ["/calendar"],
  },
  {
    to: "/albums",
    label: "相簿",
    icon: Images,
    activePrefixes: ["/albums"],
  },
  {
    to: "/more",
    label: "更多",
    icon: Menu,
    activePaths: [
      "/more",
      "/leave",
      "/contact",
      "/school-intro",
      "/location",
      "/forms",
    ],
  },
];

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const isItemActive = (item: (typeof items)[number]) => {
    if ("activePaths" in item && item.activePaths?.includes(pathname)) {
      return true;
    }

    if (
      "activePrefixes" in item &&
      item.activePrefixes?.some((prefix) => pathname.startsWith(prefix))
    ) {
      return true;
    }

    return false;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/95 backdrop-blur border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);

          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}