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
  };

  if (row.file_url) form.fileUrl = row.file_url;
  if (row.is_visible === false) {
    form.isVisible = false;
  }
  return form;
}

/** 後台表單列（說明欄位為 description，對應 DB description） */
export type AdminFormRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  isVisible: boolean;
};

function mapRowToAdmin(row: FormRow): AdminFormRecord {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description ?? "",
    fileUrl: row.file_url ?? "",
    isVisible: row.is_visible !== false,
  };
}

export type FormWriteInput = {
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  isVisible?: boolean;
};

function toDbRow(data: FormWriteInput): Record<string, unknown> {
  return {
    title: data.title.trim(),
    category: data.category,
    description: data.description.trim() || null,
    file_url: data.fileUrl.trim() || null,
    is_visible: data.isVisible !== false,
  };
}

export function formWriteFromAdmin(input: {
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  isVisible: boolean;
}): FormWriteInput {
  return {
    title: input.title,
    category: input.category,
    description: input.description,
    fileUrl: input.fileUrl,
    isVisible: input.isVisible,
  };
}

/** 前台：僅 is_visible = true */
export async function fetchForms(): Promise<PublicForm[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[formsService] Supabase forms:", error.message);
      return null;
    }
    if (!data || data.length === 0) return null;

    return data.map((row) => mapRow(row as FormRow));
  } catch (e) {
    console.warn("[formsService] fetchForms 失敗", e);
    return null;
  }
}

/** 後台：全部表單 */
export async function fetchAdminForms(): Promise<AdminFormRecord[] | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[formsService] fetchAdminForms:", error.message);
      return null;
    }

    return (data ?? []).map((row) => mapRowToAdmin(row as FormRow));
  } catch (e) {
    console.error("[formsService] fetchAdminForms 失敗", e);
    return null;
  }
}

export async function createForm(data: FormWriteInput): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: inserted, error } = await supabase.from("forms").insert(toDbRow(data)).select("id").single();

    if (error) {
      console.error("[formsService] createForm:", error.message);
      return null;
    }
    if (!inserted || typeof (inserted as { id?: string }).id !== "string") return null;
    return { id: (inserted as { id: string }).id };
  } catch (e) {
    console.error("[formsService] createForm 失敗", e);
    return null;
  }
}

export async function updateForm(id: string, data: FormWriteInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("forms").update(toDbRow(data)).eq("id", id);

    if (error) {
      console.error("[formsService] updateForm:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[formsService] updateForm 失敗", e);
    return false;
  }
}

export async function deleteForm(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from("forms").delete().eq("id", id);

    if (error) {
      console.error("[formsService] deleteForm:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[formsService] deleteForm 失敗", e);
    return false;
  }
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
