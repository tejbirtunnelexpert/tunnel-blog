import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return NextResponse.json({ posts: [] });

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image, created_at,
      categories:post_categories(category:categories(id, name, slug))
    `)
    .eq("status", "published")
    .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = data?.map((p: any) => ({
    ...p,
    categories: p.categories?.map((c: any) => c.category).filter(Boolean) || [],
  }));

  return NextResponse.json({ posts, query: q });
}
