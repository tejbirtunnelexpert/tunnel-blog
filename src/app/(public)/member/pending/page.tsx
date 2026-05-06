import Link from "next/link";
import { Radio, Clock, CheckCircle } from "lucide-react";

export default function MemberPendingPage() {
  return (
    <div className="min-h-screen bg-tunnel-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded bg-signal-amber/10 border border-signal-amber/40 flex items-center justify-center">
            <Radio className="w-4 h-4 text-signal-amber" />
          </div>
          <span className="font-semibold text-white">Tejbir <span className="text-signal-amber">Tunnel Expert</span></span>
        </Link>

        <div className="tunnel-card p-8 space-y-5">
          <div className="w-16 h-16 rounded-full bg-signal-amber/10 border-2 border-signal-amber/30 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-signal-amber" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Request Submitted!</h1>
            <p className="text-gray-400 leading-relaxed">
              Your membership request has been successfully submitted and your email & mobile have been verified.
            </p>
          </div>

          <div className="bg-tunnel-800 rounded-lg p-4 text-left space-y-2.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-300">Email verified</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-300">Mobile verified</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-signal-amber mt-0.5 shrink-0" />
              <span className="text-sm text-gray-300">Awaiting admin approval — you will be notified once your access is approved</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Once approved, you can sign in at{" "}
            <Link href="/member/login" className="text-signal-amber hover:underline">/member/login</Link>
          </p>
        </div>

        <Link href="/" className="inline-block mt-6 text-sm text-gray-500 hover:text-signal-amber transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
