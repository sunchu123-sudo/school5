import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera, ShieldAlert, Trophy, Mountain, Leaf, School,
  BookOpen, Users, LucideIcon,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { albums, albumCategories } from "@/data/mock";
import { cn } from "@/lib/utils";

const categoryVisual: Record<string, { icon: LucideIcon; gradient: string; color: string }> = {
  運動會:   { icon: Trophy,   gradient: "from-accent-soft via-accent-soft to-primary-soft",     color: "text-accent" },
  校外教學: { icon: Mountain, gradient: "from-secondary-soft via-primary-soft to-secondary-soft", color: "text-primary" },
  民族教育: { icon: Leaf,     gradient: "from-primary-soft via-accent-soft to-primary-soft",    color: "text-primary" },
  社團活動: { icon: Users,    gradient: "from-secondary-soft via-secondary-soft to-primary-soft", color: "text-secondary" },
  班級活動: { icon: BookOpen, gradient: "from-accent-soft via-primary-soft to-secondary-soft",  color: "text-accent" },
  校園生活: { icon: School,   gradient: "from-primary-soft via-secondary-soft to-accent-soft",  color: "text-primary" },
  畢業典禮: { icon: Trophy,   gradient: "from-accent-soft via-accent-soft to-secondary-soft",   color: "text-accent" },
};
const fallback = { icon: Camera, gradient: "from-primary-soft via-secondary-soft to-accent-soft", color: "text-primary/60" };

export default function Albums() {
  const [cat, setCat] = useState<string>("最新活動");
  const list = cat === "最新活動" ? albums : albums.filter((a) => a.category === cat);

  return (
    <main className="pb-28">
      <PageHeader title="活動相簿" subtitle="記錄校園生活每個瞬間" />

      <div className="mx-5 mt-4 p-3 rounded-2xl bg-accent-soft border border-accent/30 flex items-start gap-2 text-xs text-foreground">
        <ShieldAlert size={16} className="text-accent shrink-0 mt-0.5" />
        <span>學生照片公開前請確認授權與隱私,部分相簿僅限校內瀏覽。</span>
      </div>

      <div className="mt-4 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 w-max px-5">
          {albumCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "min-w-[64px] h-9 px-4 rounded-full text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center",
                cat === c ? "bg-primary text-primary-foreground shadow-card" : "bg-card border border-border text-muted-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        {list.map((al) => {
          const v = categoryVisual[al.category] ?? fallback;
          const Icon = v.icon;
          return (
            <Link key={al.id} to={`/albums/${al.id}`} className="card-base overflow-hidden active:scale-[0.99] transition">
              <div className={cn("aspect-[4/3] bg-gradient-to-br grid place-items-center", v.gradient)}>
                <Icon className={cn(v.color, "drop-shadow-sm")} size={40} strokeWidth={1.8} />
              </div>
              <div className="p-2.5">
                <div className="text-[11px] text-secondary font-semibold">{al.category}</div>
                <div className="mt-0.5 font-semibold text-[14px] leading-snug line-clamp-2">{al.title}</div>
                <div className="mt-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>{al.date.slice(5)}</span>
                  <span>{al.photoCount} 張</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="text-center text-muted-foreground py-12 text-sm">此分類暫無相簿</div>
      )}
    </main>
  );
}
