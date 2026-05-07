import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  siteName: string;
  logoUrl: string | null;
  // contact info
  contactNotifyEmail: string | null;  // where form emails go
  contactOwnerName: string | null;    // shown on contact page
  contactAddress: string | null;
  contactPublicEmail: string | null;  // shown on contact page
  contactPhone: string | null;
}

export const DEFAULT_SITE_NAME = "Tejbir Tunnel Expert";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "site_name",
        "site_logo_url",
        "contact_notify_email",
        "contact_owner_name",
        "contact_address",
        "contact_public_email",
        "contact_phone",
      ]);
    const map = Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
    return {
      siteName: map.site_name || DEFAULT_SITE_NAME,
      logoUrl: map.site_logo_url || null,
      contactNotifyEmail: map.contact_notify_email || null,
      contactOwnerName: map.contact_owner_name || null,
      contactAddress: map.contact_address || null,
      contactPublicEmail: map.contact_public_email || null,
      contactPhone: map.contact_phone || null,
    };
  } catch {
    return {
      siteName: DEFAULT_SITE_NAME,
      logoUrl: null,
      contactNotifyEmail: null,
      contactOwnerName: null,
      contactAddress: null,
      contactPublicEmail: null,
      contactPhone: null,
    };
  }
}
