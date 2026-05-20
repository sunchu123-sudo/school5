import BackPageHeader from "@/components/BackPageHeader";
import { useBackLink } from "@/hooks/use-back-link";
import { todayInfo, weeklyLunch, nutritionTip } from "@/data/mock";
import { PublicDataLoading, usePublicData } from "@/lib/publicData";
import { getFallbackTodayLunch, loadPublicTodayLunch } from "@/services/lunchService";
import { Apple, Leaf, UtensilsCrossed } from "lucide-react";

function formatDateShort(date: string) {
  const m = date.match(/(\d{1,2})月(\d{1,2})日/);
  return m ? `${Number(m[1])}/${Number(m[2])}` : date;
}

function formatWeekdayShort(weekday: string) {
  return weekday.replace("星期", "週");
}

export default function LunchInfo() {
  const { backTo, backLabel } = useBackLink("/");
  const { data: todayLunch, loading } = usePublicData(
    loadPublicTodayLunch,
    getFallbackTodayLunch,
  );

  const lunchItems = [
    { label: "主食", value: todayLunch.main },
    { label: "主菜", value: todayLunch.mainDish },
    { label: "副菜", value: todayLunch.sideDishes.join("、") },
    { label: "湯品", value: todayLunch.soup },
    { label: "水果", value: todayLunch.fruit },
  ];

  return (
    <main className="pb-28">
      <BackPageHeader title="午餐資訊" subtitle="今日與本週菜單、營養小提醒" backTo={backTo} backLabel={backLabel} />

      <div className="px-5 pt-5 space-y-6">
        {loading && <PublicDataLoading />}
        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-primary" />
            今日午餐
          </h2>
          <div className="card-base p-4 border-l-4 border-primary">
            <div className="text-xs text-primary font-semibold mb-3">
              {formatDateShort(todayInfo.date)} {formatWeekdayShort(todayInfo.weekday)} · 今日供餐
            </div>
            <dl className="space-y-2.5">
              {lunchItems.map(({ label, value }) => (
                <div key={label} className="flex gap-3 text-[15px]">
                  <dt className="w-12 shrink-0 text-muted-foreground font-medium">{label}</dt>
                  <dd className="font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-bold mb-3">本週午餐</h2>
          <div className="space-y-2.5">
            {weeklyLunch.map((day) => (
              <div
                key={day.weekday}
                className={`card-base p-4 ${day.isToday ? "ring-2 ring-primary/30 bg-primary-soft/30" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[15px]">{day.label}</span>
                  {day.isToday && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold">
                      今日
                    </span>
                  )}
                </div>
                <p className="text-[14px] font-semibold text-foreground">{day.main}</p>
                <div className="mt-1.5 space-y-0.5 text-[13px] text-muted-foreground">
                  <div>副菜：{day.sides}</div>
                  <div className="flex flex-wrap gap-x-3">
                    <span>湯：{day.soup}</span>
                    <span>水果：{day.fruit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[16px] font-bold mb-3 flex items-center gap-2">
            <Leaf size={18} className="text-primary" />
            營養小提醒
          </h2>
          <div className="card-base p-4 bg-accent-soft/50 border-accent/20">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center shrink-0">
                <Apple size={20} />
              </div>
              <p className="text-[14px] leading-relaxed text-foreground/90">{todayLunch.nutritionNote ?? nutritionTip}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
