interface Props {
  title: string;
  subtitle?: string;
}
export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="px-5 pt-6 pb-4 bg-gradient-soft border-b border-border/50">
      <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </header>
  );
}
