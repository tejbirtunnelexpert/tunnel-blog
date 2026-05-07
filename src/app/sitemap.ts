import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

function baseUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "";
  // Use production URL if env var is localhost or not https
  if (url.startsWith("https://")) return url.replace(/\/$/, "");
  return "https://tunnel-blog-fruhba1sm-tejbirtunnelexperts-projects.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const supabase = await createClient();

  // Fetch dynamic routes in parallel
  const [posts, categories, downloadCategories, tags] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("status", "published"),
    supabase.from("categories").select("slug, updated_at"),
    supabase.from("download_categories").select("slug, updated_at"),
    supabase.from("tags").select("slug"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/downloads`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const postPages: MetadataRoute.Sitemap = (posts.data || []).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = (categories.data || []).map(
    (c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  // Downloads are organised by download_categories; /downloads/[slug] maps to those
  const downloadPages: MetadataRoute.Sitemap = (
    downloadCategories.data || []
  ).map((d) => ({
    url: `${base}/downloads/${d.slug}`,
    lastModified: d.updated_at ? new Date(d.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const tagPages: MetadataRoute.Sitemap = (tags.data || []).map((t) => ({
    url: `${base}/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...postPages,
    ...categoryPages,
    ...downloadPages,
    ...tagPages,
  ];
}
