import BackPageHeader from "@/components/BackPageHeader";
import { useBackLink } from "@/hooks/use-back-link";
import { contactTopics } from "@/data/mock";
import { PublicDataLoading, usePublicData } from "@/lib/publicData";
import { getFallbackSchoolInfo, loadPublicSchoolInfo } from "@/services/schoolService";
import { Clock, MapPin, Phone, Map, MessageCircle } from "lucide-react";

export default function ContactSchool() {
  const { backTo, backLabel } = useBackLink("/");
  const { data: schoolInfo, loading } = usePublicData(
    loadPublicSchoolInfo,
    getFallbackSchoolInfo,
  );

  return (
    <main className="pb-28">
      <BackPageHeader title="聯絡學校" subtitle="電話、地址與常用聯絡項目" backTo={backTo} backLabel={backLabel} />

      <div className="px-5 pt-5 space-y-5">
        {loading && <PublicDataLoading />}
        <div className="card-base p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
              <Phone size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">學校電話</div>
              <div className="text-[17px] font-bold mt-0.5">{schoolInfo.phone}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-soft text-secondary grid place-items-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">學校地址</div>
              <div className="text-[15px] font-semibold mt-0.5 leading-snug">{schoolInfo.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">上班時間</div>
              <div className="text-[15px] font-semibold mt-0.5">{schoolInfo.officeHours}</div>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            常用聯絡項目
          </h2>
          <div className="card-base divide-y divide-border/60 overflow-hidden">
            {contactTopics.map((item) => (
              <div key={item.title} className="px-4 py-3.5">
                <div className="font-semibold text-[15px]">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-3">
          <a
            href={`tel:${schoolInfo.phoneTel}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] active:scale-[0.99] transition-transform"
          >
            <Phone size={20} />
            撥打電話
          </a>
          <a
            href={schoolInfo.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-secondary-soft text-secondary border border-secondary/20 font-semibold text-[15px] active:scale-[0.99] transition-transform"
          >
            <Map size={20} />
            {schoolInfo.mapText}
          </a>
        </div>
      </div>
    </main>
  );
}
