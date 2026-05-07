"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MarkReadButton from "./MarkReadButton";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
  read: boolean;
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (messages.length === 0) {
    return (
      <div className="tunnel-card p-10 text-center text-gray-500 text-sm">
        No contact messages yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => {
        const isOpen = expanded === msg.id;
        const date = new Date(msg.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg.id}
            className={`tunnel-card transition-all ${!msg.read ? "border-l-2 border-signal-amber" : ""}`}
          >
            {/* Header row */}
            <button
              className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/2 transition-colors rounded-xl"
              onClick={() => setExpanded(isOpen ? null : msg.id)}
            >
              {/* Unread dot */}
              <div className="shrink-0 mt-1.5">
                {!msg.read ? (
                  <span className="w-2 h-2 rounded-full bg-signal-amber block" title="Unread" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-transparent block" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${msg.read ? "text-gray-300" : "text-white"}`}>
                    {msg.name}
                  </span>
                  <span className="text-xs text-gray-500">{msg.email}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                  {msg.subject ? (
                    <span className="text-gray-400 font-medium">{msg.subject}</span>
                  ) : (
                    <span className="italic">(no subject)</span>
                  )}
                  {" — "}
                  <span>{msg.message.slice(0, 100)}{msg.message.length > 100 ? "…" : ""}</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <span className="text-xs text-gray-600 hidden sm:block">{date}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-4 pb-4 border-t border-tunnel-700 mt-0 pt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-500">
                  <div>
                    <span className="font-medium text-gray-400">From: </span>
                    {msg.name} ({msg.email})
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Subject: </span>
                    {msg.subject || "—"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">Date: </span>
                    {date}
                  </div>
                </div>
                <div className="bg-tunnel-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </div>
                <div className="flex items-center justify-between">
                  <MarkReadButton id={msg.id} read={msg.read} />
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Your message")}`}
                    className="text-xs text-signal-amber hover:text-signal-amber/80 transition-colors"
                  >
                    Reply via email
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
