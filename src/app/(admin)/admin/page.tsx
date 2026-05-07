import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, MessageSquare, Mail, TrendingUp, PlusCircle, Eye, HardDrive, Wifi, ExternalLink } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

const STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB
const BANDWIDTH_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function barColor(pct: number) {
  if (pct > 80) return "bg-red-500";
  if (pct > 50) return "bg-signal-amber";
  return "bg-green-500";
}

async function getStats() {
  const supabase = await createClient();
  const [posts, comments, pending, subscribers, memberFiles] = await Promise.all([
    supabase.from("posts").select("id, status", { count: "exact" }),
    supabase.from("comments").select("id", { count: "exact" }),
    supabase.from("comments").select("id", { count: "exact" }).eq("approved", false),
    supabase.from("newsletter_subscribers").select("id", { count: "exact" }).eq("active", true),
    supabase.from("member_files").select("file_size"),
  ]);

  const published = posts.data?.filter((p) => p.status === "published").length || 0;
  const usedBytes = memberFiles.data?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0;

  return {
    total_posts: posts.count || 0,
    published_posts: published,
    total_comments: comments.count || 0,
    pending_comments: pending.count || 0,
    total_subscribers: subscribers.count || 0,
    storage: {
      used: usedBytes,
      limit: STORAGE_LIMIT,
      pct: Math.min(100, (usedBytes / STORAGE_LIMIT) * 100),
      fileCount: memberFiles.data?.length || 0,
    },
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
  const [stats, recentPosts, { siteName }] = await Promise.all([getStats(), getRecentPosts(), getSiteSettings()]);

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
          <p className="text-sm text-gray-500 mt-0.5">Welcome back to {siteName} Admin</p>
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

      {/* Storage & Traffic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Storage */}
        <div className="tunnel-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-signal-amber" /> Storage
            </h2>
            <Link href="/admin/member-resources" className="text-xs text-signal-amber hover:underline">Manage files</Link>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.storage.fileCount} file{stats.storage.fileCount !== 1 ? "s" : ""} · {formatBytes(stats.storage.used)} used</span>
              <span>{formatBytes(stats.storage.limit)} limit</span>
            </div>
            <div className="h-3 bg-tunnel-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor(stats.storage.pct)}`}
                style={{ width: `${stats.storage.pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className={stats.storage.pct > 80 ? "text-red-400" : stats.storage.pct > 50 ? "text-signal-amber" : "text-green-400"}>
                {stats.storage.pct.toFixed(1)}% used
              </span>
              <span className="text-green-500">{formatBytes(STORAGE_LIMIT - stats.storage.used)} free</span>
            </div>
          </div>
        </div>

        {/* Traffic / Bandwidth */}
        <div className="tunnel-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Wifi className="w-4 h-4 text-signal-cyan" /> Bandwidth / Traffic
            </h2>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="text-xs text-signal-amber hover:underline flex items-center gap-1">
              Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Monthly free allowance</span>
              <span>{formatBytes(BANDWIDTH_LIMIT)} / month</span>
            </div>
            <div className="h-3 bg-tunnel-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-signal-cyan rounded-full" />
            </div>
            <p className="text-xs text-gray-600">
              Real-time bandwidth usage is available in your{" "}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
                className="text-signal-amber hover:underline">Supabase Dashboard</a>
            </p>
          </div>
        </div>
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
