import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CommentSection from "@/components/blog/CommentSection";
import NewsletterWidget from "@/components/blog/NewsletterWidget";
import ShareButton from "@/components/blog/ShareButton";
import { formatDate } from "@/lib/utils";
import { Calendar, Tag, Folder, ArrowLeft, MapPin, User } from "lucide-react";
import type { Metadata } from "next";
import { baseUrl } from "@/lib/base-url";

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
  const base = baseUrl();
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      url: `${base}/blog/${slug}`,
      images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }] : [],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image ? [post.cover_image] : [],
    },
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

          {/* Author byline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-2 border-b border-tunnel-700 pb-4">
            {post.author_name && (
              <span className="flex items-center gap-1.5 font-medium text-signal-amber">
                <User className="w-4 h-4" />
                {post.author_name}
              </span>
            )}
            {post.author_location && (
              <span className="flex items-center gap-1.5 text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                {post.author_location}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-gray-400">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
                timeZone: post.author_timezone || "Asia/Kolkata",
              })}
              {" · "}
              {new Date(post.created_at).toLocaleTimeString("en-GB", {
                hour: "2-digit", minute: "2-digit",
                timeZone: post.author_timezone || "Asia/Kolkata",
                timeZoneName: "short",
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
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

          {/* Share */}
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-tunnel-700">
            <span className="text-sm text-gray-500">Found this useful?</span>
            <ShareButton
              title={post.title}
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`}
            />
          </div>

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
