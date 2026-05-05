import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");

  let query = supabase
    .from("downloads")
    .select("*, category:download_categories(id, name, slug, thumbnail_url)")
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("download_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ downloads: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, file_url, thumbnail_url, category_id, file_size } = body;
  if (!title || !file_url) return NextResponse.json({ error: "Title and file are required" }, { status: 400 });

  const { data, error } = await supabase
    .from("downloads")
    .insert({ title, description, file_url, thumbnail_url, category_id: category_id || null, file_size })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
