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

/** 寫入 calendar_events（camelCase → snake_case） */
export type CalendarEventWriteInput = {
  title: string;
  date: string;
  time: string;
  category: string;
  location: string;
  description: string;
  isImportant: boolean;
  isVisible?: boolean;
};

function getWeekdayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAY_LABELS[d.getDay()] ?? "";
}

const VALID_EVENT_CATEGORIES: SchoolEvent["category"][] = [
  "全校",
  "班級",
  "活動",
  "放假",
  "評量",
  "社團",
];

function coerceEventCategory(cat: string): SchoolEvent["category"] {
  return VALID_EVENT_CATEGORIES.includes(cat as SchoolEvent["category"])
    ? (cat as SchoolEvent["category"])
    : "全校";
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
    category: coerceEventCategory(row.category),
  };

  if (row.description) event.note = row.description;
  if (row.is_important) event.important = true;

  return event;
}

function toDbRow(data: CalendarEventWriteInput): Record<string, unknown> {
  return {
    title: data.title.trim(),
    date: data.date,
    time: data.time?.trim() || null,
    category: data.category,
    location: data.location?.trim() || null,
    description: data.description?.trim() || null,
    is_important: data.isImportant,
    is_visible: data.isVisible !== false,
  };
}

/** 由後台表單組出寫入 payload */
export function calendarWriteFromForm(input: {
  title: string;
  date: string;
  time: string;
  category: SchoolEvent["category"];
  location: string;
  description: string;
  important: boolean;
  isVisible?: boolean;
}): CalendarEventWriteInput {
  return {
    title: input.title,
    date: input.date,
    time: input.time,
    category: input.category,
    location: input.location,
    description: input.description,
    isImportant: input.important,
    isVisible: input.isVisible !== false,
  };
}

/** 前台：僅 is_visible = true，依 date 升冪 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("is_visible", true)
      .order("date", { ascending: true });

    if (error) {
      console.error("[calendarService] Supabase calendar_events:", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    return data.map((row) => mapRow(row as CalendarEventRow));
  } catch (e) {
    console.error("[calendarService] fetchCalendarEvents 失敗", e);
    return null;
  }
}

/** 後台：全部列，依 date 升冪 */
export async function fetchAdminCalendarEvents(): Promise<CalendarEvent[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("[calendarService] fetchAdminCalendarEvents:", error.message);
      return null;
    }

    return (data ?? []).map((row) => mapRow(row as CalendarEventRow));
  } catch (e) {
    console.error("[calendarService] fetchAdminCalendarEvents 失敗", e);
    return null;
  }
}

export async function createCalendarEvent(data: CalendarEventWriteInput): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const row = toDbRow(data);
  try {
    const { data: inserted, error } = await supabase.from("calendar_events").insert(row).select("id").single();

    if (error) {
      console.error("[calendarService] createCalendarEvent:", error.message);
      return null;
    }
    if (!inserted || typeof (inserted as { id?: string }).id !== "string") return null;
    return { id: (inserted as { id: string }).id };
  } catch (e) {
    console.error("[calendarService] createCalendarEvent 失敗", e);
    return null;
  }
}

export async function updateCalendarEvent(id: string, data: CalendarEventWriteInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("calendar_events").update(toDbRow(data)).eq("id", id);

    if (error) {
      console.error("[calendarService] updateCalendarEvent:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[calendarService] updateCalendarEvent 失敗", e);
    return false;
  }
}

/**
 * 硬刪除行事曆列。
 * 提醒：正式上線可改為 is_visible = false 軟刪除。
 */
export async function deleteCalendarEvent(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);

    if (error) {
      console.error("[calendarService] deleteCalendarEvent:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[calendarService] deleteCalendarEvent 失敗", e);
    return false;
  }
}

export async function loadPublicCalendarEvents(): Promise<CalendarEvent[]> {
  return resolveWithFallback({
    fetchRemote: fetchCalendarEvents,
    getFallback: () => getPublicCalendarEvents(),
  });
}
