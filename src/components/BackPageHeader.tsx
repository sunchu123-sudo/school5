import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  backTo: string;
  backLabel?: string;
}

export default function BackPageHeader({ title, subtitle, backTo, backLabel = "返回" }: Props) {
  return (
    <div className="px-5 pt-6 pb-5 bg-gradient-soft border-b border-border/50">
      <Link to={backTo} className="text-primary inline-flex items-center gap-1 text-sm font-medium mb-3">
        <ArrowLeft size={18} /> {backLabel}
      </Link>
      <h1 className="text-xl font-bold leading-snug">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
