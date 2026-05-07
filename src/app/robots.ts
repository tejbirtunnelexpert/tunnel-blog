import { MetadataRoute } from "next";

function baseUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (url.startsWith("https://")) return url.replace(/\/$/, "");
  return "https://tunnel-blog-fruhba1sm-tejbirtunnelexperts-projects.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/login", "/member/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
