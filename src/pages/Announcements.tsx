import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Paperclip, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { AnnouncementCategory } from "@/data/mock";
import { PublicDataEmpty, PublicDataLoading, usePublicData } from "@/lib/publicData";
import { getPublicAnnouncements } from "@/lib/storage";
import { loadPublicAnnouncements } from "@/services/announcementsService";
import { cn } from "@/lib/utils";

const tabs: ("全部" | AnnouncementCategory)[] = [
  "全部", "行政公告", "班級通知", "活動通知", "午餐健康", "榮譽榜", "緊急通知",
];

export default function Announcements() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("全部");
  const [q, setQ] = useState("");

  const { data: announcements, loading, isEmpty } = usePublicData(
    loadPublicAnnouncements,
    getPublicAnnouncements,
  );

  const list = useMemo(() => {
    return announcements.filter((a) => {
      const okTab = tab === "全部" || a.category === tab;
      const okQ = !q || a.title.includes(q) || a.summary.includes(q) || a.content.includes(q);
      return okTab && okQ;
    });
  }, [announcements, tab, q]);

  return (
    <main className="pb-28">
      <PageHeader title="公告" subtitle="掌握學校最新消息" />

      <div className="px-5 pt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋公告標題、內容..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-[15px] placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="mt-4 -mx-5 px-5 overflow-x-auto scrollbar-none">
          <div className="flex gap-2 w-max">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition",
                  tab === t
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-card border border-border text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading && <PublicDataLoading />}
          {!loading && isEmpty && <PublicDataEmpty />}
          {!loading && list.length === 0 && !isEmpty && (
            <div className="text-center text-muted-foreground py-12 text-sm">沒有符合的公告</div>
          )}
          {list.map((a) => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              className={cn(
                "card-base p-4 block active:scale-[0.99] transition-transform",
                a.important && "bg-accent-soft border-accent/40 border-l-4 border-l-accent"
              )}
            >
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">{a.category}</span>
                {a.important && (
                  <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-bold flex items-center gap-0.5">
                    ★ 重要
                  </span>
                )}
                <span className="text-muted-foreground ml-auto">{a.date}</span>
              </div>
              <h3 className="mt-2 font-bold text-[16px] leading-snug">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{a.summary}</p>
              {(a.attachmentUrl || a.externalUrl) && (
                <div className="mt-3 pt-2 border-t border-border/60 flex items-center gap-4 text-xs text-secondary font-medium">
                  {a.attachmentUrl && <span className="flex items-center gap-1"><Paperclip size={14} /> 附件</span>}
                  {a.externalUrl && <span className="flex items-center gap-1"><ExternalLink size={14} /> 外部連結</span>}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
