"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Radio, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/category/tunnel-elv", label: "Tunnel ELV" },
  { href: "/category/traffic-management", label: "ITS" },
  { href: "/downloads", label: "Downloads" },
  { href: "/search", label: "Search" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-tunnel-900/95 backdrop-blur border-b border-tunnel-700">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center group-hover:border-signal-amber transition-colors">
            <Radio className="w-4 h-4 text-signal-amber" />
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">
            Tejbir <span className="text-signal-amber">Tunnel Expert</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-signal-amber hover:bg-signal-amber/5 rounded-md transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Member button */}
        <Link href="/member" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-signal-amber border border-signal-amber hover:bg-signal-amber hover:text-tunnel-900 transition-all shrink-0">
          <Users className="w-3.5 h-3.5" />
          Member
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-48 bg-tunnel-800 border border-tunnel-600 rounded-md px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-signal-amber/50 focus:w-64 transition-all"
          />
          <button type="submit" className="absolute right-2 text-gray-500 hover:text-signal-amber transition-colors">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-signal-amber transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-tunnel-900 border-b border-tunnel-700 px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-gray-400 hover:text-signal-amber hover:bg-signal-amber/5 rounded-md transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/member" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-signal-amber border border-signal-amber/50 rounded-md hover:bg-signal-amber/10 transition-colors">
            <Users className="w-4 h-4" /> Member Area
          </Link>
          <form onSubmit={handleSearch} className="pt-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="tunnel-input"
            />
          </form>
        </div>
      )}
    </header>
  );
}
