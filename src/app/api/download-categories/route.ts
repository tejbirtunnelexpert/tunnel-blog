import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("download_categories")
    .select("*, downloads(count)")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const categories = data?.map((c: any) => ({
    ...c,
    download_count: c.downloads?.[0]?.count || 0,
    downloads: undefined,
  }));

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, thumbnail_url } = body;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { data, error } = await supabase
    .from("download_categories")
    .insert({ name, slug, description, thumbnail_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
