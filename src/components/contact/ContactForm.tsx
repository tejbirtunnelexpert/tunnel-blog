"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to send message. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="tunnel-card p-6">
        <div className="flex items-start gap-3 text-green-400">
          <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/40 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">Message sent!</p>
            <p className="text-sm text-gray-400 mt-1">Your message has been sent! We&apos;ll get back to you soon.</p>
          </div>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-signal-amber hover:text-signal-amber/80 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="tunnel-card p-6">
      <h2 className="text-lg font-semibold text-white mb-5">Send a Message</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">
              Name <span className="text-signal-amber">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className="tunnel-input w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">
              Email <span className="text-signal-amber">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="tunnel-input w-full"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What is this about? (optional)"
            className="tunnel-input w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">
            Message <span className="text-signal-amber">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            placeholder="Write your message here..."
            className="tunnel-input w-full resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
            <span className="shrink-0 mt-0.5">&#9888;</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
