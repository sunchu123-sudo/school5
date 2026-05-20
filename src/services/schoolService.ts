import { resolveWithFallback } from "@/lib/dataFallback";
import { getPublicSchoolInfo, type PublicSchoolInfo } from "@/lib/storage";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

type SchoolInfoRow = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  office_hours: string | null;
  email: string | null;
  intro: string | null;
  vision: string | null;
  transportation: string | null;
  map_url: string | null;
};

function mapRow(row: SchoolInfoRow, base: PublicSchoolInfo): PublicSchoolInfo {
  const phone = row.phone ?? base.phone;
  return {
    name: row.name ?? base.name,
    phone,
    phoneTel: phone.replace(/\D/g, "") || base.phoneTel,
    address: row.address ?? base.address,
    officeHours: row.office_hours ?? base.officeHours,
    email: row.email ?? base.email,
    mapText: base.mapText,
    mapUrl: row.map_url ?? base.mapUrl,
    intro: row.intro ?? base.intro,
    vision: row.vision ?? base.vision,
    transportation: row.transportation ?? base.transportation,
  };
}

export async function fetchSchoolInfo(): Promise<PublicSchoolInfo | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("school_info")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapRow(data as SchoolInfoRow, getPublicSchoolInfo());
}

export async function loadPublicSchoolInfo(): Promise<PublicSchoolInfo> {
  return resolveWithFallback({
    fetchRemote: fetchSchoolInfo,
    getFallback: () => getPublicSchoolInfo(),
    hasData: (info) => Boolean(info.name),
  });
}

export function getFallbackSchoolInfo(): PublicSchoolInfo {
  return getPublicSchoolInfo();
}
