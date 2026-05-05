import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/blog/PostCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Post } from "@/types";

const PAGE_SIZE = 9;

async function getPosts(page: number) {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;

  const { data, count } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image, status, created_at, updated_at,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug)),
      comment_count:comments(count)
    `, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const posts = data?.map((p: any) => ({
    ...p,
    categories: p.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: p.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    comment_count: p.comment_count?.[0]?.count || 0,
  })) as Post[];

  return { posts, total: count || 0 };
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1"));
  const { posts, total } = await getPosts(page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">All Articles</h1>
        <p className="text-gray-500 text-sm">{total} posts on tunnel ELV, ITS and automation</p>
      </div>

      {posts?.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => <PostCard key={post.id} post={post} featured />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              {page > 1 && (
                <Link href={`/blog?page=${page - 1}`} className="btn-secondary gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Previous
                </Link>
              )}
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              {page < totalPages && (
                <Link href={`/blog?page=${page + 1}`} className="btn-secondary gap-1.5">
                  Next <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No posts published yet.</p>
          <p className="text-sm">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
