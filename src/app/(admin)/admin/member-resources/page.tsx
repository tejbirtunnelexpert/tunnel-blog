"use client";

import { useEffect, useState, useRef } from "react";
import { FolderOpen, Upload, Trash2, Loader2, Pencil, Check, X, File, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: number; name: string; sort_order: number; }
interface MemberFile {
  id: string; title: string; description: string | null;
  file_url: string; file_name: string | null; file_size: number | null;
  file_type: string | null; category_id: number | null;
  category: { id: number; name: string } | null;
  created_at: string;
}

function formatBytes(b: number | null) {
  if (!b) return "";
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MemberResourcesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<MemberFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<number | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", categoryId: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [catRes, fileRes] = await Promise.all([
      fetch("/api/admin/member-categories"),
      fetch("/api/admin/member-files"),
    ]);
    const catData = await catRes.json();
    const fileData = await fileRes.json();
    setCategories(catData.categories || []);
    setFiles(fileData.files || []);
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
    const fileInput = fileRef.current;
    if (!fileInput?.files?.[0]) { toast.error("Please select a file."); return; }
    if (!form.title.trim()) { toast.error("Title is required."); return; }
    if (!form.categoryId) { toast.error("Select a category."); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", fileInput.files[0]);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("categoryId", form.categoryId);

    const res = await fetch("/api/admin/member-files", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      toast.success("File uploaded!");
      setFiles(prev => [data, ...prev]);
      setForm(f => ({ ...f, title: "", description: "" }));
      if (fileInput) fileInput.value = "";
    } else toast.error(data.error || "Upload failed.");
    setUploading(false);
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/admin/member-files/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("File deleted.");
      setFiles(prev => prev.filter(f => f.id !== id));
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
          <div className="sm:col-span-2">
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading…" : "Upload File"}
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
