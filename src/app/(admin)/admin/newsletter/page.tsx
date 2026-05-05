import { createClient } from "@/lib/supabase/server";
import { Mail, Users, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getSubscribers() {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false });
  return { subscribers: data || [], total: count || 0 };
}

export default async function NewsletterPage() {
  const { subscribers, total } = await getSubscribers();
  const active = subscribers.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsletter</h1>
          <p className="text-sm text-gray-500">{total} subscribers · {active} active</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="tunnel-card p-5">
          <Users className="w-5 h-5 text-signal-amber mb-3" />
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-sm text-gray-400">Total Subscribers</div>
        </div>
        <div className="tunnel-card p-5">
          <Mail className="w-5 h-5 text-signal-cyan mb-3" />
          <div className="text-3xl font-bold text-white">{active}</div>
          <div className="text-sm text-gray-400">Active Subscribers</div>
        </div>
      </div>

      {/* Subscriber list */}
      <div className="tunnel-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-tunnel-700">
          <h2 className="text-sm font-semibold text-white">Subscribers</h2>
          <span className="text-xs text-gray-500">{total} emails</span>
        </div>
        {subscribers.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tunnel-700">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Subscribed</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tunnel-700">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-tunnel-700/40 transition-colors">
                  <td className="px-5 py-3 text-gray-300">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(sub.subscribed_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${sub.active ? "text-green-400" : "text-gray-600"}`}>
                      {sub.active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
            No subscribers yet. Newsletter widget is live on the site.
          </div>
        )}
      </div>
    </div>
  );
}
