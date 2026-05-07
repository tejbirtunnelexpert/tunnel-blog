import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  siteName: string;
  logoUrl: string | null;
}

export const DEFAULT_SITE_NAME = "Tejbir Tunnel Expert";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["site_name", "site_logo_url"]);
    const map = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
    return {
      siteName: map.site_name || DEFAULT_SITE_NAME,
      logoUrl: map.site_logo_url || null,
    };
  } catch {
    return { siteName: DEFAULT_SITE_NAME, logoUrl: null };
  }
}
