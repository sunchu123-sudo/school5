import BackPageHeader from "@/components/BackPageHeader";
import { downloadForms } from "@/data/mock";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function FormDownload() {
  const handleDownload = (title: string) => {
    toast.info("下載功能開發中", {
      description: `「${title}」將於正式上線後提供下載。`,
    });
  };

  return (
    <main className="pb-28">
      <BackPageHeader title="表單下載" subtitle="常用申請表單一覽" backTo="/more" backLabel="返回更多" />

      <div className="px-5 pt-5 space-y-3">
        {downloadForms.map((form) => (
          <button
            key={form.id}
            type="button"
            onClick={() => handleDownload(form.title)}
            className="card-base w-full p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px]">{form.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{form.desc}</div>
            </div>
            <Download size={20} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </main>
  );
}
