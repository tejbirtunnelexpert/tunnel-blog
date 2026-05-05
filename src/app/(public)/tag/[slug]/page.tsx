import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/blog/PostCard";
import { Tag } from "lucide-react";
import type { Post } from "@/types";

async function getTagWithPosts(slug: string) {
  const supabase = await createClient();
  const { data: tag } = await supabase.from("tags").select("*").eq("slug", slug).single();
  if (!tag) return null;

  const { data: postLinks } = await supabase.from("post_tags").select("post_id").eq("tag_id", tag.id);
  const postIds = postLinks?.map((p) => p.post_id) || [];
  if (!postIds.length) return { tag, posts: [] };

  const { data } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image, status, created_at, updated_at,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug)),
      comment_count:comments(count)
    `)
    .eq("status", "published")
    .in("id", postIds)
    .order("created_at", { ascending: false });

  const posts = data?.map((p: any) => ({
    ...p,
    categories: p.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: p.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    comment_count: p.comment_count?.[0]?.count || 0,
  })) as Post[];

  return { tag, posts };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getTagWithPosts(slug);
  if (!result) notFound();

  const { tag, posts } = result;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-signal-cyan/10 border border-signal-cyan/30 flex items-center justify-center">
          <Tag className="w-4 h-4 text-signal-cyan" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">#{tag.name}</h1>
          <p className="text-xs text-gray-600">{posts.length} articles</p>
        </div>
      </div>
      {posts.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => <PostCard key={p.id} post={p} featured />)}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No posts with this tag yet.</p>
      )}
    </div>
  );
}
