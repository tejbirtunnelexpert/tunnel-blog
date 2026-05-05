import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import DeletePostButton from "@/components/admin/DeletePostButton";

async function getPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(`
      id, title, slug, status, created_at, updated_at,
      categories:post_categories(category:categories(name)),
      comment_count:comments(count)
    `)
    .order("created_at", { ascending: false });

  return data?.map((p: any) => ({
    ...p,
    categories: p.categories?.map((c: any) => c.category?.name).filter(Boolean) || [],
    comment_count: p.comment_count?.[0]?.count || 0,
  })) || [];
}

export default async function PostsAdminPage() {
  const posts = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-sm text-gray-500">{posts.length} total posts</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="tunnel-card overflow-hidden">
        {posts.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tunnel-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tunnel-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-tunnel-700/40 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={post.status === "published" ? "status-published shrink-0" : "status-draft shrink-0"} />
                      <span className="text-gray-200 font-medium line-clamp-1">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {post.categories.length > 0 ? (
                      <span className="signal-badge">{post.categories[0]}</span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium capitalize ${post.status === "published" ? "text-green-400" : "text-gray-500"}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {post.status === "published" && (
                        <Link href={`/blog/${post.slug}`} target="_blank"
                          className="p-1.5 text-gray-500 hover:text-signal-cyan hover:bg-signal-cyan/10 rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link href={`/admin/posts/${post.id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-signal-amber hover:bg-signal-amber/10 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-3">No posts yet.</p>
            <Link href="/admin/posts/new" className="btn-primary inline-flex">
              <PlusCircle className="w-4 h-4" /> Create First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
