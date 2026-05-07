import { createClient } from "@/lib/supabase/server";
import MessageList from "./MessageList";

export const metadata = { title: "Contact Messages — Admin" };

async function getMessages() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, name, email, subject, message, created_at, read")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("contact_messages fetch error:", error);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

export default async function ContactMessagesPage() {
  const messages = await getMessages();
  const unreadCount = messages.filter((m: any) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
        {messages.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-tunnel-700 text-gray-300">
            {messages.length} total
            {unreadCount > 0 && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-signal-amber">{unreadCount} unread</span>
              </>
            )}
          </span>
        )}
      </div>

      <MessageList messages={messages} />
    </div>
  );
}
