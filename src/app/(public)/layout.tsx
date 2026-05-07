import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/site-settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { siteName, logoUrl } = await getSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <Header siteName={siteName} logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer siteName={siteName} logoUrl={logoUrl} />
    </div>
  );
}
