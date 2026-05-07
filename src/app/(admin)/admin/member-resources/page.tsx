"use client";

import { useEffect, useState, useRef } from "react";
import {
  FolderOpen, Upload, Trash2, Loader2, Pencil, Check, X,
  File, HardDrive, Wifi, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: number; name: string; sort_order: number; }
interface MemberFile {
  id: string; title: string; description: string | null;
  file_url: string; file_name: string | null; file_size: number | null;
  file_type: string | null; category_id: number | null;
  category: { id: number; name: string } | null;
  created_at: string;
}
interface StorageStats {
  storage: { used: number; limit: number; free: number; pct: number; fileCount: number };
  bandwidth: { limit: number; note: string; dashboardUrl: string };
}

function formatBytes(b: number | null) {
  if (!b) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function barColor(pct: number) {
  if (pct > 80) return "bg-red-500";
  if (pct > 50) return "bg-signal-amber";
  return "bg-green-500";
}

function StorageBar({ label, used, limit, pct, icon: Icon, sub }: {
  label: string; used: number; limit: number; pct: number;
  icon: React.ElementType; sub?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        <span className="text-gray-500">{formatBytes(used)} / {formatBytes(limit)}</span>
      </div>
      <div className="h-2 bg-tunnel-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{pct.toFixed(1)}% used</span>
        <span className="text-green-500">{formatBytes(limit - used)} free</span>
      </div>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  );
}

export default function MemberResourcesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<MemberFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<number | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [catRes, fileRes, statsRes] = await Promise.all([
      fetch("/api/admin/member-categories"),
      fetch("/api/admin/member-files"),
      fetch("/api/admin/storage-stats"),
    ]);
    const catData = await catRes.json();
    const fileData = await fileRes.json();
    const statsData = await statsRes.json();
    setCategories(catData.categories || []);
    setFiles(fileData.files || []);
    setStats(statsData);
    if (catData.categories?.length) {
      setForm(f => ({ ...f, categoryId: String(catData.categories[0].id) }));
    }
    setLoading(false);
  }

  async function saveCategoryName(id: number) {
    const res = await fetch(`/api/admin/member-categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      toast.success("Category renamed.");
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName } : c));
      setEditingCat(null);
    } else toast.error("Failed to rename.");
  }

  async function uploadFile(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error("Please select a file."); return; }
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.categoryId) { toast.error("Select a category."); return; }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get signed upload URL from server
      const urlRes = await fetch(`/api/admin/upload-signed-url?filename=${encodeURIComponent(file.name)}`);
      if (!urlRes.ok) { toast.error("Could not get upload URL."); return; }
      const { signedUrl, path, token } = await urlRes.json();

      // Step 2: Upload file directly to Supabase via XHR (bypasses Vercel — no 4.5MB limit)
      // Use XHR so we get real upload progress events
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            setProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      }).catch((err: Error) => {
        toast.error(err.message || "Upload failed.");
        throw err;
      });

      // Step 3: Save metadata to database
      const metaRes = await fetch("/api/admin/member-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId,
          filePath: path,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });

      const data = await metaRes.json();
      if (metaRes.ok) {
        toast.success("File uploaded successfully!");
        setFiles(prev => [{ ...data, category: categories.find(c => c.id === parseInt(form.categoryId)) || null }, ...prev]);
        setForm(f => ({ ...f, title: "", description: "" }));
        if (fileRef.current) fileRef.current.value = "";
        // Refresh stats
        fetch("/api/admin/storage-stats").then(r => r.json()).then(setStats);
      } else {
        toast.error(data.error || "Failed to save file record.");
      }
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/admin/member-files/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("File deleted.");
      setFiles(prev => prev.filter(f => f.id !== id));
      fetch("/api/admin/storage-stats").then(r => r.json()).then(setStats);
    } else toast.error("Delete failed.");
  }

  const visibleFiles = activeTab === "all" ? files : files.filter(f => f.category_id === activeTab);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-signal-amber" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Member Resources</h1>
        <p className="text-sm text-gray-500">Upload files for members · Rename categories</p>
      </div>

      {/* Storage & Traffic indicators */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="tunnel-card p-5 space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" /> Storage Used
            </h2>
            <StorageBar
              label={`${stats.storage.fileCount} file${stats.storage.fileCount !== 1 ? "s" : ""} uploaded`}
              used={stats.storage.used}
              limit={stats.storage.limit}
              pct={stats.storage.pct}
              icon={HardDrive}
            />
          </div>
          <div className="tunnel-card p-5 space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" /> Bandwidth / Traffic
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Monthly limit</span>
                <span className="text-gray-500">{formatBytes(stats.bandwidth.limit)} / month</span>
              </div>
              <div className="h-2 bg-tunnel-700 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-signal-cyan rounded-full" />
              </div>
              <p className="text-xs text-gray-600">{stats.bandwidth.note}</p>
              <a href={stats.bandwidth.dashboardUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-signal-amber hover:underline">
                View in Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Categories rename */}
      <div className="tunnel-card p-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <FolderOpen className="w-4 h-4" /> Category Names
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-tunnel-800 border border-tunnel-700 rounded-lg p-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-signal-amber shrink-0" />
              {editingCat === cat.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="tunnel-input py-1 text-sm flex-1" autoFocus
                    onKeyDown={e => { if (e.key === "Enter") saveCategoryName(cat.id); if (e.key === "Escape") setEditingCat(null); }}
                  />
                  <button onClick={() => saveCategoryName(cat.id)} className="text-green-400 hover:text-green-300">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingCat(null)} className="text-gray-500 hover:text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-200 flex-1 truncate">{cat.name}</span>
                  <button onClick={() => { setEditingCat(cat.id); setEditName(cat.name); }}
                    className="text-gray-600 hover:text-signal-amber transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload form */}
      <div className="tunnel-card p-5 space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload File for Members
        </h2>
        <p className="text-xs text-gray-600">Files upload directly to Supabase — no size restriction from Vercel (up to 50 MB on free plan)</p>
        <form onSubmit={uploadFile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">File *</label>
            <input type="file" ref={fileRef} accept=".pdf,.ppt,.pptx,.ppts,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg"
              className="tunnel-input file:bg-tunnel-700 file:border-0 file:text-gray-300 file:text-xs file:px-2 file:py-1 file:rounded file:mr-3 file:cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="File title" className="tunnel-input" required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Category *</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="tunnel-input">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Description (optional)</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this file" className="tunnel-input" />
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading directly to Supabase…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-tunnel-700 rounded-full overflow-hidden">
                <div className="h-full bg-signal-amber rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? `Uploading… ${progress}%` : "Upload File"}
            </button>
          </div>
        </form>
      </div>

      {/* File list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${activeTab === "all" ? "bg-signal-amber text-tunnel-900" : "bg-tunnel-800 text-gray-400 border border-tunnel-700"}`}>
            All ({files.length})
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${activeTab === cat.id ? "bg-signal-amber text-tunnel-900" : "bg-tunnel-800 text-gray-400 border border-tunnel-700"}`}>
              {cat.name} ({files.filter(f => f.category_id === cat.id).length})
            </button>
          ))}
        </div>

        {visibleFiles.length === 0 ? (
          <div className="tunnel-card p-8 text-center text-gray-500 text-sm">No files uploaded yet.</div>
        ) : (
          <div className="tunnel-card overflow-hidden">
            <div className="divide-y divide-tunnel-800">
              {visibleFiles.map(f => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3 hover:bg-tunnel-800/40">
                  <File className="w-4 h-4 text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 font-medium truncate">{f.title}</div>
                    <div className="text-xs text-gray-500">
                      {f.category?.name} · {f.file_name} {f.file_size ? `· ${formatBytes(f.file_size)}` : ""}
                    </div>
                  </div>
                  <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-signal-amber hover:underline shrink-0">View</a>
                  <button onClick={() => deleteFile(f.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
