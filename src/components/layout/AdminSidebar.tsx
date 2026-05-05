"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, FileText, MessageSquare, Tag,
  Mail, LogOut, Radio, ExternalLink, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-tunnel-900 border-r border-tunnel-700 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-tunnel-700">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center">
            <Radio className="w-4 h-4 text-signal-amber" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">
              Tejbir <span className="text-signal-amber">Tunnel Expert</span>
            </div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                active
                  ? "bg-signal-amber/10 text-signal-amber border border-signal-amber/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-tunnel-800"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-tunnel-700 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-300 hover:bg-tunnel-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
