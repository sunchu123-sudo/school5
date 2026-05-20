import BackPageHeader from "@/components/BackPageHeader";
import { locationInfo } from "@/data/mock";
import { PublicDataLoading, usePublicData } from "@/lib/dataFallback";
import { getFallbackSchoolInfo, loadPublicSchoolInfo } from "@/services/schoolService";
import { Bus, Map, MapPin, Landmark } from "lucide-react";

export default function Location() {
  const { data: schoolInfo, loading } = usePublicData(
    loadPublicSchoolInfo,
    getFallbackSchoolInfo,
  );
  const transportLines = schoolInfo.transportation
    ? schoolInfo.transportation.split("\n").filter(Boolean)
    : locationInfo.transport;

  return (
    <main className="pb-28">
      <BackPageHeader title="交通位置" subtitle="地址、交通方式與附近地標" backTo="/more" backLabel="返回更多" />

      <div className="px-5 pt-5 space-y-5">
        {loading && <PublicDataLoading />}
        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            學校地址
          </h2>
          <div className="card-base p-4">
            <p className="text-[15px] font-semibold leading-relaxed">{schoolInfo.address}</p>
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <Bus size={18} className="text-secondary" />
            交通方式
          </h2>
          <div className="card-base p-4 space-y-3">
            {transportLines.map((line) => (
              <p key={line} className="text-[14px] leading-relaxed text-foreground/90 flex gap-2">
                <span className="text-primary shrink-0">•</span>
                {line}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <Landmark size={18} className="text-accent" />
            附近地標
          </h2>
          <div className="card-base p-4">
            <ul className="space-y-2">
              {locationInfo.landmarks.map((mark) => (
                <li key={mark} className="text-[14px] text-foreground/90 flex gap-2">
                  <span className="text-accent shrink-0">•</span>
                  {mark}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <a
          href={schoolInfo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] active:scale-[0.99] transition-transform"
        >
          <Map size={20} />
          {schoolInfo.mapText}
        </a>
      </div>
    </main>
  );
}
