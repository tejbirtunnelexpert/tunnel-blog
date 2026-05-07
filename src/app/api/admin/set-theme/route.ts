import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_THEMES = ["night-ops", "daylight", "amethyst"] as const;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { theme } = await req.json();
  if (!VALID_THEMES.includes(theme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  // Persist to database — affects ALL visitors on ALL browsers
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "site_theme", value: theme });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also set a cookie for immediate SSR on current browser without a reload
  const res = NextResponse.json({ ok: true });
  res.cookies.set("site-theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}
