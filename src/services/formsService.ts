import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicForms, type PublicForm } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

type FormRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file_url: string | null;
  is_visible: boolean;
};

function mapRow(row: FormRow): PublicForm {
  const form: PublicForm = {
    id: row.id,
    title: row.title,
    desc: row.description ?? "",
    category: row.category,
    isVisible: row.is_visible !== false,
  };

  if (row.file_url) form.fileUrl = row.file_url;
  return form;
}

export async function fetchForms(): Promise<PublicForm[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  return data.map((row) => mapRow(row as FormRow));
}

export async function loadPublicForms(): Promise<PublicForm[]> {
  return resolveWithFallback({
    fetchRemote: fetchForms,
    getFallback: () => getPublicForms(),
  });
}

export function getFallbackForms(): PublicForm[] {
  return getPublicForms();
}
