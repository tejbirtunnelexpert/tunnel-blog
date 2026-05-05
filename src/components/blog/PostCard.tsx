import Link from "next/link";
import Image from "next/image";
import { Calendar, MessageSquare, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types";

interface Props {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: Props) {
  if (featured) {
    return (
      <article className="tunnel-card overflow-hidden group">
        {post.cover_image && (
          <div className="relative h-56 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tunnel-800/90 to-transparent" />
          </div>
        )}
        <div className="p-5">
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="signal-badge hover:bg-signal-amber/20 transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
          <h2 className="text-xl font-bold text-white group-hover:text-signal-amber transition-colors leading-tight mb-2">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          {post.excerpt && (
            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.created_at)}
            </span>
            {post.comment_count !== undefined && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.comment_count} comments
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="tunnel-card p-4 group flex gap-4">
      {post.cover_image && (
        <div className="relative w-24 h-20 shrink-0 overflow-hidden rounded-md">
          <Image src={post.cover_image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {post.categories && post.categories.length > 0 && (
          <Link href={`/category/${post.categories[0].slug}`} className="text-xs text-signal-amber hover:underline">
            {post.categories[0].name}
          </Link>
        )}
        <h3 className="text-sm font-semibold text-white group-hover:text-signal-amber transition-colors leading-snug mt-0.5 mb-1.5 line-clamp-2">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(post.created_at)}
          </span>
          {post.tags && post.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {post.tags[0].name}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
