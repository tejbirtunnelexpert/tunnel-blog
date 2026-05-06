"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Trash2, Loader2, Eye, EyeOff, ShieldCheck, ShieldOff } from "lucide-react";
import toast from "react-hot-toast";

interface Member {
  id: string; name: string; email: string; mobile: string; password: string;
  company: string | null; position: string | null; approved: boolean;
  email_verified: boolean; mobile_verified: boolean; created_at: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    const res = await fetch("/api/admin/members");
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }

  async function toggleApproval(m: Member) {
    setUpdating(m.id);
    const res = await fetch(`/api/admin/members/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !m.approved }),
    });
    if (res.ok) {
      toast.success(m.approved ? "Member suspended." : "Member approved!");
      setMembers(prev => prev.map(x => x.id === m.id ? { ...x, approved: !x.approved } : x));
    } else toast.error("Update failed.");
    setUpdating(null);
  }

  async function deleteMember(id: string) {
    if (!confirm("Delete this member permanently?")) return;
    setUpdating(id);
    const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Member deleted.");
      setMembers(prev => prev.filter(m => m.id !== id));
    } else toast.error("Delete failed.");
    setUpdating(null);
  }

  function togglePasswordVisibility(id: string) {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const pending = members.filter(m => !m.approved && m.email_verified);
  const approved = members.filter(m => m.approved);
  const unverified = members.filter(m => !m.email_verified);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-signal-amber" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-signal-amber" /> Members
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} total · {pending.length} pending approval</p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-yellow-400"><Clock className="w-3.5 h-3.5" /> {pending.length} Pending</span>
          <span className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-3.5 h-3.5" /> {approved.length} Approved</span>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="tunnel-card p-12 text-center text-gray-500">No member requests yet.</div>
      ) : (
        <div className="tunnel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tunnel-700 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Member</th>
                  <th className="text-left px-4 py-3">Mobile</th>
                  <th className="text-left px-4 py-3">Company / Position</th>
                  <th className="text-left px-4 py-3">Password</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tunnel-800">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-tunnel-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.email}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {new Date(m.created_at).toLocaleDateString("en-GB")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{m.mobile}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{m.company || "—"}</div>
                      <div className="text-xs text-gray-500">{m.position || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-300">
                          {visiblePasswords.has(m.id) ? m.password : "••••••••"}
                        </span>
                        <button onClick={() => togglePasswordVisibility(m.id)}
                          className="text-gray-600 hover:text-gray-300 transition-colors">
                          {visiblePasswords.has(m.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {!m.email_verified ? (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <XCircle className="w-3.5 h-3.5" /> Not verified
                        </span>
                      ) : m.approved ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {m.email_verified && (
                          <button
                            onClick={() => toggleApproval(m)}
                            disabled={updating === m.id}
                            title={m.approved ? "Suspend" : "Approve"}
                            className={`p-1.5 rounded transition-colors ${
                              m.approved
                                ? "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                : "text-gray-500 hover:text-green-400 hover:bg-green-500/10"
                            }`}
                          >
                            {updating === m.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : m.approved ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button onClick={() => deleteMember(m.id)} disabled={updating === m.id}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
