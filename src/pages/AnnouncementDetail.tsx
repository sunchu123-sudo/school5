import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Paperclip, ExternalLink, Calendar } from "lucide-react";
import { getPublicAnnouncements } from "@/lib/storage";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const a = getPublicAnnouncements().find((x) => x.id === id);

  if (!a) {
    return (
      <main className="page-pad">
        <Link to="/announcements" className="text-primary inline-flex items-center gap-1"><ArrowLeft size={18}/> 返回</Link>
        <p className="mt-6 text-muted-foreground">找不到這則公告</p>
      </main>
    );
  }

  return (
    <main className="pb-28">
      <div className="px-5 pt-6 pb-5 bg-gradient-soft border-b border-border/50">
        <Link to="/announcements" className="text-primary inline-flex items-center gap-1 text-sm font-medium mb-3">
          <ArrowLeft size={18} /> 返回公告
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-semibold">{a.category}</span>
          {a.important && <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-semibold">重要</span>}
        </div>
        <h1 className="mt-3 text-xl font-bold leading-snug">{a.title}</h1>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar size={14} /> {a.date}
        </div>
      </div>

      <article className="px-5 pt-5">
        <div className="card-base p-5 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
          {a.content}
        </div>

        {(a.attachmentUrl || a.externalUrl) && (
          <div className="mt-4 space-y-2">
            {a.attachmentUrl && (
              <a href={a.attachmentUrl} className="card-base p-4 flex items-center gap-3 active:scale-[0.99] transition">
                <div className="w-10 h-10 rounded-xl bg-secondary-soft text-secondary grid place-items-center">
                  <Paperclip size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]">下載附件</div>
                  <div className="text-xs text-muted-foreground">點此檢視相關檔案</div>
                </div>
              </a>
            )}
            {a.externalUrl && (
              <a href={a.externalUrl} className="card-base p-4 flex items-center gap-3 active:scale-[0.99] transition">
                <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center">
                  <ExternalLink size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]">前往外部連結</div>
                  <div className="text-xs text-muted-foreground">於瀏覽器開啟</div>
                </div>
              </a>
            )}
          </div>
        )}
      </article>
    </main>
  );
}
