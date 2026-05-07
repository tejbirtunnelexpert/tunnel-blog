export function baseUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "";
  if (url.startsWith("https://")) return url.replace(/\/$/, "");
  return "https://tunnel-blog-fruhba1sm-tejbirtunnelexperts-projects.vercel.app";
}
