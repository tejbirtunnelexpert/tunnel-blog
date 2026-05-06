"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Radio, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const memberId = params.get("id") || "";
  const [mobileOtp, setMobileOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) router.push("/member/signup");
  }, [memberId, router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (mobileOtp.length !== 4) {
      toast.error("Please enter the 4-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/member/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, mobileOtp }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Mobile verified!");
      router.push("/member/pending");
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
            <ShieldCheck className="w-5 h-5 text-signal-amber" />
            <h1 className="text-2xl font-bold text-white">Verify Mobile</h1>
          </div>
          <p className="text-sm text-gray-500">Enter the 4-digit OTP sent to your mobile number</p>
        </div>

        <form onSubmit={handleVerify} className="tunnel-card p-6 space-y-5">
          <div>
            <label className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Mobile OTP
            </label>
            <input
              value={mobileOtp}
              onChange={e => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="• • • •"
              maxLength={4}
              className="tunnel-input text-center text-3xl tracking-[0.6em] font-bold py-4"
              inputMode="numeric"
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading || mobileOtp.length !== 4} className="btn-primary w-full justify-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {loading ? "Verifying…" : "Verify & Continue"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Didn&apos;t receive OTP?{" "}
          <Link href="/member/signup" className="text-signal-amber hover:underline">Start over</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
