import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { siteName, logoUrl } = await getSiteSettings();

  return (
    <AdminThemeProvider>
      <div className="flex min-h-screen">
        <AdminSidebar siteName={siteName} logoUrl={logoUrl} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6 md:p-8">{children}</div>
        </main>
      </div>
    </AdminThemeProvider>
  );
}
