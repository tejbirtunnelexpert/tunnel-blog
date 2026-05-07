"use client";

import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Use native Web Share API if available (mobile + modern desktop)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this article: ${title}`,
          url,
        });
        return;
      } catch (e: any) {
        // User cancelled share — do nothing
        if (e?.name === "AbortError") return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-tunnel-600 text-gray-400 hover:text-signal-amber hover:border-signal-amber/40 hover:bg-signal-amber/5 transition-all text-sm"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share this article
        </>
      )}
    </button>
  );
}
