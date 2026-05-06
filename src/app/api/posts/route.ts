import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");
  const offset = (page - 1) * limit;

  let query = supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image, status, created_at, updated_at,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug)),
      comment_count:comments(count)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  else query = query.eq("status", "published");

  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if (cat) {
      const { data: postIds } = await supabase.from("post_categories").select("post_id").eq("category_id", cat.id);
      if (postIds) query = query.in("id", postIds.map((p) => p.post_id));
    }
  }

  if (tagSlug) {
    const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).single();
    if (tag) {
      const { data: postIds } = await supabase.from("post_tags").select("post_id").eq("tag_id", tag.id);
      if (postIds) query = query.in("id", postIds.map((p) => p.post_id));
    }
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = data?.map((p: any) => ({
    ...p,
    categories: p.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: p.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    comment_count: p.comment_count?.[0]?.count || 0,
  }));

  return NextResponse.json({ posts, total: count, page, limit });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, cover_image, status, categories, tags, author_name, author_location, author_timezone } = body;
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const slug = slugify(title) + "-" + Date.now().toString(36);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      title, slug, content, excerpt, cover_image,
      status: status || "draft",
      author_id: user.id,
      author_name: author_name || null,
      author_location: author_location || null,
      author_timezone: author_timezone || "Asia/Kolkata",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (categories?.length) {
    await supabase.from("post_categories").insert(
      categories.map((id: string) => ({ post_id: post.id, category_id: id }))
    );
  }

  if (tags?.length) {
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      let { data: tag } = await supabase.from("tags").select().eq("slug", tagSlug).single();
      if (!tag) {
        const { data: newTag } = await supabase.from("tags").insert({ name: tagName, slug: tagSlug }).select().single();
        tag = newTag;
      }
      if (tag) await supabase.from("post_tags").insert({ post_id: post.id, tag_id: tag.id });
    }
  }

  return NextResponse.json(post, { status: 201 });
}
