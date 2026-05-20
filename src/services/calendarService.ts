import type { SchoolEvent } from "@/data/mock";
import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicCalendarEvents, type CalendarEvent } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

type CalendarEventRow = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  category: string;
  location: string | null;
  description: string | null;
  is_important: boolean;
  is_visible: boolean;
};

function getWeekdayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAY_LABELS[d.getDay()] ?? "";
}

function mapRow(row: CalendarEventRow): CalendarEvent {
  const date = row.date;
  const event: CalendarEvent = {
    id: row.id,
    title: row.title,
    date,
    weekday: getWeekdayLabel(date),
    time: row.time ?? "",
    location: row.location ?? "",
    audience: "全校",
    category: row.category as SchoolEvent["category"],
  };

  if (row.description) event.note = row.description;
  if (row.is_important) event.important = true;

  return event;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("is_visible", true)
    .order("date", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return data.map((row) => mapRow(row as CalendarEventRow));
}

export async function loadPublicCalendarEvents(): Promise<CalendarEvent[]> {
  return resolveWithFallback({
    fetchRemote: fetchCalendarEvents,
    getFallback: () => getPublicCalendarEvents(),
  });
}
