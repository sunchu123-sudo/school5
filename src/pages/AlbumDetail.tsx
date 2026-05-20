import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Camera, ShieldAlert } from "lucide-react";
import { PublicDataLoading, usePublicDataById } from "@/lib/publicData";
import { getFallbackAlbumById, loadPublicAlbumById } from "@/services/albumsService";

export default function AlbumDetail() {
  const { id } = useParams();
  const { data: al, loading } = usePublicDataById(
    id,
    loadPublicAlbumById,
    (albumId) => getFallbackAlbumById(albumId),
  );

  if (loading) {
    return (
      <main className="page-pad">
        <PublicDataLoading />
      </main>
    );
  }

  if (!al) {
    return (
      <main className="page-pad">
        <Link to="/albums" className="text-primary inline-flex items-center gap-1"><ArrowLeft size={18}/> 返回</Link>
        <p className="mt-6 text-muted-foreground">找不到這本相簿</p>
      </main>
    );
  }

  return (
    <main className="pb-28">
      <div className="px-5 pt-6 pb-5 bg-gradient-soft border-b border-border/50">
        <Link to="/albums" className="text-primary inline-flex items-center gap-1 text-sm font-medium mb-3">
          <ArrowLeft size={18} /> 返回相簿
        </Link>
        <div className="text-xs text-secondary font-semibold">{al.category}</div>
        <h1 className="mt-1 text-xl font-bold leading-snug">{al.title}</h1>
        <div className="mt-1 text-sm text-muted-foreground">{al.date} · 共 {al.photoCount} 張</div>
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{al.description}</p>
      </div>

      <div className="mx-5 mt-4 p-3 rounded-2xl bg-accent-soft border border-accent/30 flex items-start gap-2 text-xs">
        <ShieldAlert size={16} className="text-accent shrink-0 mt-0.5" />
        <span>學生照片公開前請確認授權與隱私。</span>
      </div>

      <div className="px-5 mt-4 grid grid-cols-3 gap-2">
        {al.photos.map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-primary-soft via-secondary-soft to-accent-soft grid place-items-center">
            <Camera className="text-primary/40" size={20} />
          </div>
        ))}
      </div>
    </main>
  );
}
