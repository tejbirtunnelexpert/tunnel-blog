import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/blog/PostCard";
import { Folder } from "lucide-react";
import type { Post } from "@/types";
import type { Metadata } from "next";

async function getCategoryWithPosts(slug: string) {
  const supabase = await createClient();
  const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (!cat) return null;

  const { data: postLinks } = await supabase.from("post_categories").select("post_id").eq("category_id", cat.id);
  const postIds = postLinks?.map((p) => p.post_id) || [];

  if (!postIds.length) return { category: cat, posts: [] };

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

  return { category: cat, posts };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCategoryWithPosts(slug);
  if (!result) return { title: "Category Not Found" };
  return { title: result.category.name, description: result.category.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getCategoryWithPosts(slug);
  if (!result) notFound();

  const { category, posts } = result;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-signal-amber/10 border border-signal-amber/30 flex items-center justify-center shrink-0">
          <Folder className="w-5 h-5 text-signal-amber" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{category.name}</h1>
          {category.description && <p className="text-gray-500 text-sm mt-1">{category.description}</p>}
          <p className="text-xs text-gray-600 mt-1">{posts.length} articles</p>
        </div>
      </div>

      {posts.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => <PostCard key={post.id} post={post} featured />)}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No published posts in this category yet.</p>
      )}
    </div>
  );
}
