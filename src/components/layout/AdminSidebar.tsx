"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, FileText, MessageSquare,
  Mail, LogOut, Radio, ExternalLink, FolderOpen, Download, Images, Users, BookOpen, Palette, Settings, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAdminTheme, type AdminTheme } from "@/components/admin/AdminThemeProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/hero-slides", label: "Hero Slideshow", icon: Images },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/contact-messages", label: "Contact Messages", icon: MessageCircle },
  { href: "/admin/member-resources", label: "Member Resources", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const themes: { id: AdminTheme; label: string; dot: string; bg: string }[] = [
  { id: "night-ops",  label: "Night Ops",  dot: "#f59e0b", bg: "#050708" },
  { id: "daylight",   label: "Daylight",   dot: "#1d4ed8", bg: "#ffffff" },
  { id: "amethyst",   label: "Amethyst",   dot: "#a855f7", bg: "#1e1040" },
];

interface AdminSidebarProps {
  siteName?: string;
  logoUrl?: string | null;
}

export default function AdminSidebar({ siteName, logoUrl }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useAdminTheme();

  // Split siteName: first word in primary color, rest in accent
  const effectiveName = siteName || "Tejbir Tunnel Expert";
  const spaceIdx = effectiveName.indexOf(" ");
  const nameFirst = spaceIdx === -1 ? "" : effectiveName.slice(0, spaceIdx);
  const nameRest = spaceIdx === -1 ? effectiveName : effectiveName.slice(spaceIdx + 1);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 admin-sidebar min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 admin-sidebar-border-b">
        <Link href="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-7 h-7 object-contain rounded" />
          ) : (
            <div className="w-8 h-8 rounded admin-accent-bg-faint admin-accent-border flex items-center justify-center">
              <Radio className="w-4 h-4 admin-accent-text" />
            </div>
          )}
          <div>
            <div className="font-semibold admin-text-primary text-sm">
              {nameFirst && <>{nameFirst} </>}
              <span className="admin-accent-text">{nameRest}</span>
            </div>
            <div className="text-xs admin-text-muted">Admin Panel</div>
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
                  ? "admin-nav-active"
                  : "admin-nav-inactive"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Theme switcher */}
      <div className="px-3 pb-2">
        <div className="admin-sidebar-border-t pt-3">
          <div className="flex items-center gap-2 px-1 mb-2">
            <Palette className="w-3.5 h-3.5 admin-text-muted" />
            <span className="text-xs admin-text-muted font-medium">Panel Theme</span>
          </div>
          <div className="flex flex-col gap-1">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-all w-full text-left",
                  theme === t.id
                    ? "admin-nav-active"
                    : "admin-nav-inactive"
                )}
              >
                {/* Color swatch */}
                <span
                  className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: t.bg, borderColor: t.dot }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: t.dot }}
                  />
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 admin-sidebar-border-t space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm admin-text-muted admin-hover-link transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm admin-text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
