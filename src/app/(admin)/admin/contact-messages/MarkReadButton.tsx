"use client";

import { useState } from "react";
import { Loader2, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  read: boolean;
}

export default function MarkReadButton({ id, read }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !read }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={read ? "Mark as unread" : "Mark as read"}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
        read
          ? "text-gray-500 hover:text-gray-300 hover:bg-tunnel-700"
          : "text-signal-amber hover:text-white hover:bg-signal-amber/10"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCheck className="w-3.5 h-3.5" />
      )}
      {read ? "Mark unread" : "Mark read"}
    </button>
  );
}
