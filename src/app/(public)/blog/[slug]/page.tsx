import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CommentSection from "@/components/blog/CommentSection";
import NewsletterWidget from "@/components/blog/NewsletterWidget";
import { formatDate } from "@/lib/utils";
import { Calendar, Tag, Folder, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug)),
      comments(id, author_name, content, created_at, approved)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;

  return {
    ...data,
    categories: data.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    comments: data.comments?.filter((c: any) => c.approved) || [],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: { title: post.title, description: post.excerpt || undefined, images: post.cover_image ? [post.cover_image] : [] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Article */}
        <article className="lg:col-span-2">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-signal-amber transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>

          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((cat: any) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="signal-badge">
                  <Folder className="w-3 h-3" /> {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.created_at)}
            </span>
            {post.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-4 h-4" />
                {post.tags.map((tag: any) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`} className="hover:text-signal-amber transition-colors">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {post.cover_image && (
            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 border border-tunnel-700">
              <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {/* Content */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <CommentSection postId={post.id} comments={post.comments} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <NewsletterWidget />

          {post.tags.length > 0 && (
            <div className="tunnel-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-signal-cyan" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`} className="cyan-badge hover:bg-signal-cyan/20 transition-colors">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
