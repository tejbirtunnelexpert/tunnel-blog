"use client";

import Link from "next/link";
import { useState } from "react";
import { Radio, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface FooterProps {
  siteName?: string;
  logoUrl?: string | null;
}

export default function Footer({ siteName = "Tejbir Tunnel Expert", logoUrl }: FooterProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Split on first space: first word in white, rest in amber
  const spaceIdx = siteName.indexOf(" ");
  const nameFirst = spaceIdx === -1 ? "" : siteName.slice(0, spaceIdx);
  const nameRest = spaceIdx === -1 ? siteName : siteName.slice(spaceIdx + 1);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Subscribed! Welcome to ${siteName}.`);
        setEmail("");
      } else {
        toast.error(data.error || "Subscription failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-tunnel-900 border-t border-tunnel-700 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-7 h-7 object-contain rounded" />
              ) : (
                <div className="w-8 h-8 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-signal-amber" />
                </div>
              )}
              <span className="font-semibold text-white text-sm">
                {nameFirst && <>{nameFirst} </>}
                <span className="text-signal-amber">{nameRest}</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sharing expertise in Tunnel ELV systems, Intelligent Transportation Systems, and road automation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Topics</h4>
            <ul className="space-y-2">
              {[
                { href: "/category/tunnel-elv", label: "Tunnel ELV" },
                { href: "/category/traffic-management", label: "Traffic Management" },
                { href: "/category/automation", label: "Automation" },
                { href: "/category/road-safety", label: "Road Safety" },
                { href: "/category/technology", label: "Technology" },
                { href: "/contact", label: "Contact Us" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-signal-amber transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-tunnel-600 group-hover:bg-signal-amber transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Newsletter
            </h4>
            <p className="text-sm text-gray-500 mb-3">Get the latest posts delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-tunnel-800 border border-tunnel-600 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-signal-amber/50 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-3 py-2 shrink-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="road-divider my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} {siteName} Blog. All rights reserved.</span>
          <Link href="/admin" className="hover:text-signal-amber transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
