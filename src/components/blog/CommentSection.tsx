"use client";

import { useState } from "react";
import { MessageSquare, User, Send } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import type { Comment } from "@/types";
import toast from "react-hot-toast";

interface Props {
  postId: string;
  comments: Comment[];
}

export default function CommentSection({ postId, comments: initial }: Props) {
  const [comments, setComments] = useState(initial);
  const [form, setForm] = useState({ author_name: "", author_email: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, post_id: postId }),
      });
      if (res.ok) {
        toast.success("Comment submitted! It will appear after approval.");
        setForm({ author_name: "", author_email: "", content: "" });
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to submit.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-tunnel-700">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-signal-amber" />
        {comments.length} Comment{comments.length !== 1 ? "s" : ""}
      </h3>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-tunnel-700 border border-tunnel-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 bg-tunnel-800 border border-tunnel-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-white">{c.author_name}</span>
                  <span className="text-xs text-gray-600">{formatRelative(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-8">No comments yet. Be the first!</p>
      )}

      {/* Comment form */}
      <div className="bg-tunnel-800 border border-tunnel-600 rounded-lg p-5">
        <h4 className="text-sm font-semibold text-white mb-4">Leave a Comment</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              placeholder="Your name *"
              required
              className="tunnel-input"
            />
            <input
              type="email"
              value={form.author_email}
              onChange={(e) => setForm({ ...form, author_email: e.target.value })}
              placeholder="Email (not shown) *"
              required
              className="tunnel-input"
            />
          </div>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Your comment *"
            required
            rows={4}
            className="tunnel-input resize-none"
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            <Send className="w-4 h-4" />
            {submitting ? "Submitting…" : "Submit Comment"}
          </button>
          <p className="text-xs text-gray-600">Comments are moderated before publishing.</p>
        </form>
      </div>
    </section>
  );
}
