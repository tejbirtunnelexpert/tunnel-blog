import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, MessageSquare, Mail, TrendingUp, PlusCircle, Eye } from "lucide-react";

async function getStats() {
  const supabase = await createClient();
  const [posts, comments, pending, subscribers] = await Promise.all([
    supabase.from("posts").select("id, status", { count: "exact" }),
    supabase.from("comments").select("id", { count: "exact" }),
    supabase.from("comments").select("id", { count: "exact" }).eq("approved", false),
    supabase.from("newsletter_subscribers").select("id", { count: "exact" }).eq("active", true),
  ]);

  const published = posts.data?.filter((p) => p.status === "published").length || 0;

  return {
    total_posts: posts.count || 0,
    published_posts: published,
    total_comments: comments.count || 0,
    pending_comments: pending.count || 0,
    total_subscribers: subscribers.count || 0,
  };
}

async function getRecentPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}

export default async function AdminDashboard() {
  const [stats, recentPosts] = await Promise.all([getStats(), getRecentPosts()]);

  const statCards = [
    { label: "Total Posts", value: stats.total_posts, sub: `${stats.published_posts} published`, icon: FileText, color: "text-signal-amber" },
    { label: "Comments", value: stats.total_comments, sub: `${stats.pending_comments} pending`, icon: MessageSquare, color: "text-signal-cyan", alert: stats.pending_comments > 0 },
    { label: "Subscribers", value: stats.total_subscribers, sub: "newsletter", icon: Mail, color: "text-green-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back to Tejbir Tunnel Expert Admin</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color, alert }) => (
          <div key={label} className="tunnel-card p-5 relative">
            {alert && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-signal-amber animate-pulse" />
            )}
            <div className={`${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-sm font-medium text-gray-300">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="tunnel-card p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/posts/new", label: "New Post", icon: PlusCircle },
            { href: "/admin/comments?filter=pending", label: "Review Comments", icon: MessageSquare },
            { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
            { href: "/", label: "View Site", icon: Eye },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-tunnel-700 hover:bg-tunnel-600 border border-tunnel-600 hover:border-tunnel-500 transition-all group text-center"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-signal-amber transition-colors" />
              <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      <div className="tunnel-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-tunnel-700">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-signal-amber" /> Recent Posts
          </h2>
          <Link href="/admin/posts" className="text-xs text-signal-amber hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-tunnel-700">
          {recentPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between px-5 py-3 hover:bg-tunnel-700/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className={post.status === "published" ? "status-published" : "status-draft"} />
                <span className="text-sm text-gray-200 truncate">{post.title}</span>
              </div>
              <Link href={`/admin/posts/${post.id}/edit`} className="text-xs text-gray-500 hover:text-signal-amber transition-colors shrink-0 ml-3">
                Edit
              </Link>
            </div>
          ))}
          {recentPosts.length === 0 && (
            <div className="px-5 py-6 text-sm text-gray-500">No posts yet. <Link href="/admin/posts/new" className="text-signal-amber hover:underline">Create your first post</Link></div>
          )}
        </div>
      </div>
    </div>
  );
}
