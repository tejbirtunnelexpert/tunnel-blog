"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radio, Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function MemberLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "PENDING") {
          toast("Your account is pending admin approval.", { icon: "⏳" });
          router.push("/member/pending");
          return;
        }
        toast.error(data.error);
        return;
      }

      toast.success("Welcome back!");
      router.push("/member");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-tunnel-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center">
              <Radio className="w-4 h-4 text-signal-amber" />
            </div>
            <span className="font-semibold text-white">Tejbir <span className="text-signal-amber">Tunnel Expert</span></span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <LogIn className="w-5 h-5 text-signal-amber" />
            <h1 className="text-2xl font-bold text-white">Member Login</h1>
          </div>
          <p className="text-sm text-gray-500">Sign in to access the member resource library</p>
        </div>

        <form onSubmit={handleLogin} className="tunnel-card p-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email Address (Username)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} required
              type="email" placeholder="you@example.com" className="tunnel-input" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <div className="relative">
              <input value={password} onChange={e => setPassword(e.target.value)} required
                type={showPassword ? "text" : "password"} placeholder="Your password" className="tunnel-input pr-10" />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Not a member yet?{" "}
          <Link href="/member/signup" className="text-signal-amber hover:underline">Sign up</Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}
