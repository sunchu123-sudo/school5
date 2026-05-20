import BackPageHeader from "@/components/BackPageHeader";
import { schoolInfo, leaveProcess, leaveDocuments } from "@/data/mock";
import { ClipboardList, FileText, Phone, ClipboardEdit } from "lucide-react";
import { toast } from "sonner";

export default function StudentLeave() {
  const handleDemoForm = () => {
    toast.info("請假表單功能開發中", {
      description: "目前為示意按鈕，正式上線後可線上填寫。",
    });
  };

  return (
    <main className="pb-28">
      <BackPageHeader title="學生請假" subtitle="請假流程與聯絡方式說明" backTo="/" backLabel="返回首頁" />

      <div className="px-5 pt-5 space-y-5">
        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <ClipboardList size={18} className="text-primary" />
            請假流程說明
          </h2>
          <div className="card-base p-4">
            <ol className="space-y-3">
              {leaveProcess.map((step, i) => (
                <li key={step} className="flex gap-3 text-[14px] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-bold grid place-items-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <FileText size={18} className="text-secondary" />
            請假需要準備的資料
          </h2>
          <div className="card-base p-4">
            <ul className="space-y-2">
              {leaveDocuments.map((doc) => (
                <li key={doc} className="flex items-start gap-2 text-[14px] text-foreground/90">
                  <span className="text-primary mt-1">•</span>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-bold mb-3">聯絡導師或學校</h2>
          <div className="card-base p-4">
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              請假請先聯絡孩子班級導師；若無法聯絡導師，可撥打學校總機，由行政人員協助轉達。
            </p>
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2 text-[15px] font-semibold">
              <Phone size={18} className="text-primary shrink-0" />
              學校電話：{schoolInfo.phone}
            </div>
          </div>
        </section>

        <div className="space-y-3 pt-1">
          <a
            href={`tel:${schoolInfo.phoneTel}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] active:scale-[0.99] transition-transform"
          >
            <Phone size={20} />
            撥打學校電話
          </a>
          <button
            type="button"
            onClick={handleDemoForm}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-accent-soft text-accent border border-accent/30 font-semibold text-[15px] active:scale-[0.99] transition-transform"
          >
            <ClipboardEdit size={20} />
            填寫請假表單
          </button>
        </div>
      </div>
    </main>
  );
}
