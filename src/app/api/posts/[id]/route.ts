import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug)),
      comments(id, author_name, content, created_at, approved)
    `)
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq("comments.approved", true)
    .single();

  if (error) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const post = {
    ...data,
    categories: data.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
  };

  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, cover_image, status, categories, tags } = body;

  const updates: Record<string, unknown> = { content, excerpt, cover_image, status };
  if (title) {
    updates.title = title;
    updates.slug = slugify(title) + "-" + Date.now().toString(36);
  }

  const { data: post, error } = await supabase
    .from("posts").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace categories
  if (categories !== undefined) {
    await supabase.from("post_categories").delete().eq("post_id", id);
    if (categories.length) {
      await supabase.from("post_categories").insert(
        categories.map((cid: string) => ({ post_id: id, category_id: cid }))
      );
    }
  }

  // Replace tags
  if (tags !== undefined) {
    await supabase.from("post_tags").delete().eq("post_id", id);
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      let { data: tag } = await supabase.from("tags").select().eq("slug", tagSlug).single();
      if (!tag) {
        const { data: newTag } = await supabase.from("tags").insert({ name: tagName, slug: tagSlug }).select().single();
        tag = newTag;
      }
      if (tag) await supabase.from("post_tags").insert({ post_id: id, tag_id: tag.id });
    }
  }

  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
