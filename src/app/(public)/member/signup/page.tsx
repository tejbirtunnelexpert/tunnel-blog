"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radio, Loader2, Eye, EyeOff, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function MemberSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [devOtps, setDevOtps] = useState<{ emailOtp: string; mobileOtp: string; memberId: string } | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", password: "", company: "", position: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/member/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      if (data._dev) {
        // Dev mode: show OTPs on screen, don't auto-redirect
        setDevOtps({ emailOtp: data._dev.emailOtp, mobileOtp: data._dev.mobileOtp, memberId: data.memberId });
      } else {
        toast.success("OTPs sent to your email and mobile!");
        router.push(`/member/verify?id=${data.memberId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-tunnel-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center">
              <Radio className="w-4 h-4 text-signal-amber" />
            </div>
            <span className="font-semibold text-white">Tejbir <span className="text-signal-amber">Tunnel Expert</span></span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-signal-amber" />
            <h1 className="text-2xl font-bold text-white">Member Sign Up</h1>
          </div>
          <p className="text-sm text-gray-500">Create your member account to access exclusive resources</p>
        </div>

        {devOtps && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5 mb-4 space-y-4">
            <p className="text-yellow-400 font-semibold text-sm">⚠ Email/SMS not configured — OTPs shown here for testing</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-tunnel-900 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Email OTP</p>
                <p className="text-3xl font-bold tracking-[0.3em] text-signal-amber">{devOtps.emailOtp}</p>
              </div>
              <div className="bg-tunnel-900 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Mobile OTP</p>
                <p className="text-3xl font-bold tracking-[0.3em] text-signal-amber">{devOtps.mobileOtp}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Note both OTPs above, then click the button below to continue.</p>
            <button
              onClick={() => router.push(`/member/verify?id=${devOtps.memberId}`)}
              className="btn-primary w-full justify-center"
            >
              I&apos;ve noted the OTPs — Continue to Verify →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="tunnel-card p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Full Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} required
              placeholder="Your full name" className="tunnel-input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email Address * (this is your username)</label>
            <input value={form.email} onChange={e => set("email", e.target.value)} required
              type="email" placeholder="you@example.com" className="tunnel-input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Mobile Number *</label>
            <input value={form.mobile} onChange={e => set("mobile", e.target.value)} required
              placeholder="+91 98765 43210" className="tunnel-input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Password * <span className="text-yellow-500/70">(visible to admin)</span>
            </label>
            <div className="relative">
              <input value={form.password} onChange={e => set("password", e.target.value)} required
                type={showPassword ? "text" : "password"} placeholder="Choose a password" className="tunnel-input pr-10" />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Company</label>
              <input value={form.company} onChange={e => set("company", e.target.value)}
                placeholder="e.g. ACME Corp" className="tunnel-input" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Position</label>
              <input value={form.position} onChange={e => set("position", e.target.value)}
                placeholder="e.g. Engineer" className="tunnel-input" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Sending OTPs…" : "Send OTP & Continue"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already a member?{" "}
          <Link href="/member/login" className="text-signal-amber hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
