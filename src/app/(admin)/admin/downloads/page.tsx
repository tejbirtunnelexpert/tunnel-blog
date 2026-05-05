"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Download as DlType } from "@/types";

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<DlType[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/downloads");
    const data = await res.json();
    setDownloads(data.downloads || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this download?")) return;
    const res = await fetch(`/api/downloads/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); load(); }
    else toast.error("Failed to delete");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Downloads</h1>
          <p className="text-gray-400 text-sm mt-1">Manage downloadable files and PDFs</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/downloads/categories" className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" /> Categories
          </Link>
          <Link href="/admin/downloads/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Download
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-12">
          <Loader2 className="w-5 h-5 animate-spin text-signal-amber" /> Loading…
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Download className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">No downloads yet</p>
          <Link href="/admin/downloads/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add your first download
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((dl) => (
            <div key={dl.id} className="bg-tunnel-800 border border-tunnel-700 rounded-xl p-4 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-tunnel-900 shrink-0 flex items-center justify-center">
                {dl.thumbnail_url ? (
                  <img src={dl.thumbnail_url} alt={dl.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-7 h-7 text-tunnel-600" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{dl.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {dl.category && (
                    <span className="bg-tunnel-700 px-2 py-0.5 rounded text-gray-400">{dl.category.name}</span>
                  )}
                  {dl.file_size && <span>{dl.file_size}</span>}
                  <span>{new Date(dl.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={dl.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors"
                  title="Preview"
                >
                  <Download className="w-4 h-4" />
                </a>
                <Link
                  href={`/admin/downloads/${dl.id}/edit`}
                  className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(dl.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
