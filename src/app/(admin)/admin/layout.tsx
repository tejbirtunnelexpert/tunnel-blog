import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-tunnel-950">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
