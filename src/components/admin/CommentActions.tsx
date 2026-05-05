"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props { commentId: string; approved: boolean; }

export default function CommentActions({ commentId, approved }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function patch(action: "approve" | "reject" | "delete") {
    setLoading(true);
    try {
      if (action === "delete") {
        if (!confirm("Delete this comment permanently?")) { setLoading(false); return; }
        const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
        if (res.ok) { toast.success("Comment deleted."); router.refresh(); }
        else toast.error("Delete failed.");
      } else {
        const res = await fetch(`/api/comments/${commentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved: action === "approve" }),
        });
        if (res.ok) {
          toast.success(action === "approve" ? "Comment approved." : "Comment rejected.");
          router.refresh();
        } else toast.error("Action failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-gray-500 shrink-0" />;

  return (
    <div className="flex items-center gap-1 shrink-0">
      {!approved && (
        <button onClick={() => patch("approve")}
          className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors" title="Approve">
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
      {approved && (
        <button onClick={() => patch("reject")}
          className="p-1.5 text-gray-500 hover:text-signal-amber hover:bg-signal-amber/10 rounded transition-colors" title="Unapprove">
          <XCircle className="w-4 h-4" />
        </button>
      )}
      <button onClick={() => patch("delete")}
        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
