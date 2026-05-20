import BackPageHeader from "@/components/BackPageHeader";
import { schoolIntroSections } from "@/data/mock";
import { School, Sparkles, Mountain, Target } from "lucide-react";

const sectionIcons = [School, Sparkles, Mountain, Target];

export default function SchoolIntro() {
  return (
    <main className="pb-28">
      <BackPageHeader title="學校介紹" subtitle="認識三棧國小的故事與願景" backTo="/more" backLabel="返回更多" />

      <div className="px-5 pt-5 space-y-4">
        {schoolIntroSections.map((section, i) => {
          const Icon = sectionIcons[i] ?? School;
          return (
            <article key={section.title} className="card-base p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary grid place-items-center">
                  <Icon size={18} />
                </div>
                <h2 className="text-[16px] font-bold">{section.title}</h2>
              </div>
              <p className="text-[14px] leading-relaxed text-foreground/90">{section.content}</p>
            </article>
          );
        })}

        <p className="text-center text-xs text-muted-foreground pt-2">
          在山海與文化中，陪伴孩子茁壯成長
        </p>
      </div>
    </main>
  );
}
