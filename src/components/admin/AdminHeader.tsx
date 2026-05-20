import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, School } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminHeaderProps = {
  onLogout: () => void;
};

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <School className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wider text-primary/70">ADMIN</p>
            <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
              三棧國小 · 後台管理
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-primary/20" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">登出</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl border-primary/20">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回前台</span>
              <span className="sm:hidden">前台</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
