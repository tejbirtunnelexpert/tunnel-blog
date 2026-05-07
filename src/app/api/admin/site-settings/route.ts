import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteName, logoUrl } = await req.json();
  const updates: Array<{ key: string; value: string }> = [];

  if (siteName !== undefined) {
    const trimmed = String(siteName).slice(0, 50).trim();
    if (!trimmed) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    updates.push({ key: "site_name", value: trimmed });
  }
  if (logoUrl !== undefined) {
    updates.push({ key: "site_logo_url", value: logoUrl || "" });
  }

  if (updates.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { error } = await supabase.from("site_settings").upsert(updates);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
