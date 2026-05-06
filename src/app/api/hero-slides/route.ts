import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, image_url, caption, position, opacity, show_caption")
    .eq("active", true)
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slides: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { image_url, caption, sort_order, position, opacity, show_caption, heading, subtext } = body;
  if (!image_url) return NextResponse.json({ error: "Image is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("hero_slides")
    .insert({
      image_url,
      caption,
      sort_order: sort_order || 0,
      position: position || "50% 50%",
      opacity: opacity ?? 80,
      show_caption: show_caption !== false,
      heading: heading || null,
      subtext: subtext || null,
      active: true,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
