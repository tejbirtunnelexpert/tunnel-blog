import Link from "next/link";
import { Radio } from "lucide-react";

export const metadata: import("next").Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-tunnel-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-signal-amber/10 border border-signal-amber/30 flex items-center justify-center mx-auto mb-6">
          <Radio className="w-8 h-8 text-signal-amber" />
        </div>
        <div className="text-7xl font-bold text-signal-amber/30 mb-2">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-6">The road ends here. This page doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary">← Back to Home</Link>
      </div>
    </div>
  );
}
