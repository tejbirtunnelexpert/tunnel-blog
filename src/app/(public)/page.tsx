import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/blog/PostCard";
import NewsletterWidget from "@/components/blog/NewsletterWidget";
import { ArrowRight, Radio, Cpu, TrafficCone, Zap } from "lucide-react";
import type { Post } from "@/types";

async function getPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(`
      id, title, slug, excerpt, cover_image, status, created_at, updated_at,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug)),
      comment_count:comments(count)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(7);

  return data?.map((p: any) => ({
    ...p,
    categories: p.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: p.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    comment_count: p.comment_count?.[0]?.count || 0,
  })) as Post[];
}

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name, slug").limit(6);
  return data || [];
}

const features = [
  { icon: Radio, label: "Tunnel ELV", desc: "Low voltage systems, SCADA & monitoring" },
  { icon: TrafficCone, label: "ITS Solutions", desc: "Intelligent transport management" },
  { icon: Cpu, label: "Automation", desc: "PLC, control panels & integration" },
  { icon: Zap, label: "Road Safety", desc: "Incident detection & emergency systems" },
];

export default async function HomePage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const [featured, ...rest] = posts || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-tunnel-gradient border-b border-tunnel-700 py-20 px-4">
        {/* Tunnel perspective lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to bottom right, transparent 49%, #f59e0b22 49%, #f59e0b22 51%, transparent 51%),
              linear-gradient(to bottom left, transparent 49%, #f59e0b22 49%, #f59e0b22 51%, transparent 51%)
            `,
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 signal-badge mb-6">
            <Radio className="w-3.5 h-3.5" />
            <span>Tejbir Tunnel Expert — ELV & ITS Insights</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Where Infrastructure<br />
            <span className="text-signal-amber">Meets Intelligence</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Deep-dive articles on road tunnel ELV systems, ITS platforms, traffic automation, and smart infrastructure by Tejbir — a practicing Tunnel ELV & Automation specialist.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Link href="/blog" className="btn-primary">
              Explore Articles <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/search" className="btn-secondary">
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Feature pills */}
      <section className="border-b border-tunnel-700 bg-tunnel-900/50">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-signal-amber/10 border border-signal-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-signal-amber" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="text-xs text-gray-500 leading-snug">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-signal-amber rounded-full inline-block" />
                Latest Posts
              </h2>
              <Link href="/blog" className="text-sm text-signal-amber hover:text-signal-amber-bright flex items-center gap-1 transition-colors">
                All posts <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {featured && <PostCard post={featured} featured />}

            <div className="space-y-3">
              {rest.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <NewsletterWidget />

            {/* Categories */}
            <div className="tunnel-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-signal-cyan rounded-full inline-block" />
                Topics
              </h3>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-400 hover:text-signal-amber hover:bg-signal-amber/5 transition-colors group"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
