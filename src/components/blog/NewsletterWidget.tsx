"use client";

import { useState } from "react";
import { Mail, ArrowRight, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to subscribe.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-tunnel-800 to-tunnel-700 border border-signal-amber/20 rounded-xl p-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-signal-amber/10 rounded-full blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-signal-amber" />
          <span className="text-xs font-semibold text-signal-amber uppercase tracking-widest">Newsletter</span>
        </div>
        <h3 className="text-base font-bold text-white mb-1">Stay in the loop</h3>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          Get the latest from Tejbir on Tunnel ELV, ITS & traffic automation.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-tunnel-900/60 border border-tunnel-600 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-signal-amber/50 transition-colors"
          />
          <button type="submit" disabled={loading} className="btn-primary px-3 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
