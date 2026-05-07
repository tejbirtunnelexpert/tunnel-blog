import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  return NextResponse.json({
    siteName: map.site_name || "",
    logoUrl: map.site_logo_url || null,
    contactNotifyEmail: map.contact_notify_email || "",
    contactOwnerName: map.contact_owner_name || "",
    contactAddress: map.contact_address || "",
    contactPublicEmail: map.contact_public_email || "",
    contactPhone: map.contact_phone || "",
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { siteName, logoUrl, contactNotifyEmail, contactOwnerName, contactAddress, contactPublicEmail, contactPhone } = body;
  const updates: Array<{ key: string; value: string }> = [];

  if (siteName !== undefined) {
    const trimmed = String(siteName).slice(0, 50).trim();
    if (!trimmed) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    updates.push({ key: "site_name", value: trimmed });
  }
  if (logoUrl !== undefined) {
    updates.push({ key: "site_logo_url", value: logoUrl || "" });
  }
  if (contactNotifyEmail !== undefined) {
    updates.push({ key: "contact_notify_email", value: contactNotifyEmail || "" });
  }
  if (contactOwnerName !== undefined) {
    updates.push({ key: "contact_owner_name", value: contactOwnerName || "" });
  }
  if (contactAddress !== undefined) {
    updates.push({ key: "contact_address", value: contactAddress || "" });
  }
  if (contactPublicEmail !== undefined) {
    updates.push({ key: "contact_public_email", value: contactPublicEmail || "" });
  }
  if (contactPhone !== undefined) {
    updates.push({ key: "contact_phone", value: contactPhone || "" });
  }

  if (updates.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { error } = await supabase.from("site_settings").upsert(updates);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
