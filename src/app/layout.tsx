import "./globals.css";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { baseUrl } from "@/lib/base-url";

export async function generateMetadata() {
  const { siteName, logoUrl } = await getSiteSettings();
  const base = baseUrl();
  return {
    metadataBase: new URL(base),
    title: { default: siteName, template: `%s | ${siteName}` },
    description: "Insights on Tunnel ELV, ITS, Traffic Management & Road Automation by Tejbir Singh Dhillon — a practicing Tunnel ELV & Automation specialist.",
    keywords: ["tunnel ELV", "ITS", "traffic management", "road automation", "SCADA", "tunnel automation", "ELV systems", "intelligent transportation"],
    authors: [{ name: "Tejbir Singh Dhillon" }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: base,
      siteName: siteName,
      title: siteName,
      description: "Insights on Tunnel ELV, ITS, Traffic Management & Road Automation",
      images: logoUrl ? [{ url: logoUrl, width: 200, height: 200, alt: siteName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: "Insights on Tunnel ELV, ITS, Traffic Management & Road Automation",
      images: logoUrl ? [logoUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 1. Try the database first (true site-wide setting, affects all browsers)
  let theme = "night-ops";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_theme")
      .single();
    if (data?.value) theme = data.value;
  } catch {
    // 2. Fallback to cookie (local browser override) if DB unavailable
    const cookieStore = await cookies();
    theme = cookieStore.get("site-theme")?.value || "night-ops";
  }

  return (
    <html lang="en" data-site-theme={theme}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111620",
              color: "#e5e7eb",
              border: "1px solid #2e3e52",
            },
            success: { iconTheme: { primary: "#f59e0b", secondary: "#050708" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#050708" } },
          }}
        />
      </body>
    </html>
  );
}
