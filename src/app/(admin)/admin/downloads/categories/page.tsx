"use client";

import { useEffect, useState, useRef } from "react";
import { FolderOpen, Plus, Pencil, Trash2, Loader2, Upload, X, ImageIcon, Save } from "lucide-react";
import toast from "react-hot-toast";
import type { DownloadCategory } from "@/types";

export default function DownloadCategoriesPage() {
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);

  const emptyForm = { name: "", description: "", thumbnail_url: "" };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/download-categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadThumb(file: File) {
    setUploadingThumb(true);
    const toastId = toast.loading("Uploading thumbnail…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "bog_images");
      const res = await fetch("/api/upload-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(f => ({ ...f, thumbnail_url: data.url }));
      toast.success("Thumbnail uploaded!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingThumb(false);
      if (thumbRef.current) thumbRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/download-categories/${editingId}` : "/api/download-categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success(editingId ? "Category updated!" : "Category created!");
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Downloads in it will become uncategorized.")) return;
    const res = await fetch(`/api/download-categories/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); load(); }
    else toast.error("Failed to delete");
  }

  function startEdit(cat: DownloadCategory) {
    setForm({ name: cat.name, description: cat.description || "", thumbnail_url: cat.thumbnail_url || "" });
    setEditingId(cat.id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Download Categories</h1>
          <p className="text-gray-400 text-sm mt-1">Organize downloads into categories with thumbnails</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Category
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-tunnel-800 border border-tunnel-600 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-5">{editingId ? "Edit Category" : "New Category"}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Presentations, Technical Guides"
                className="tunnel-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description…"
                rows={2}
                className="tunnel-input resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Thumbnail Image</label>
              {form.thumbnail_url ? (
                <div className="flex items-center gap-3">
                  <img src={form.thumbnail_url} alt="thumb" className="w-24 h-16 object-cover rounded-lg border border-tunnel-600" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, thumbnail_url: "" }))} className="text-gray-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-3 border-2 border-dashed border-tunnel-600 rounded-lg cursor-pointer hover:border-signal-amber/50 transition-colors w-fit">
                  {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin text-signal-amber" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-gray-300">Upload thumbnail</span>
                  <input ref={thumbRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadThumb(f); }} />
                </label>
              )}
              <input
                value={form.thumbnail_url}
                onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                placeholder="Or paste image URL…"
                className="tunnel-input text-sm mt-2"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Update" : "Create"} Category
              </button>
              <button onClick={cancelForm} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-12">
          <Loader2 className="w-5 h-5 animate-spin text-signal-amber" /> Loading…
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No categories yet. Create one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-tunnel-800 border border-tunnel-700 rounded-xl overflow-hidden">
              <div className="h-28 bg-tunnel-900 relative">
                {cat.thumbnail_url ? (
                  <img src={cat.thumbnail_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-10 h-10 text-tunnel-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-tunnel-900/60 to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{cat.name}</h3>
                {cat.description && <p className="text-gray-400 text-sm mt-1 line-clamp-1">{cat.description}</p>}
                <p className="text-xs text-gray-500 mt-1">{cat.download_count || 0} files</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => startEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-tunnel-700 text-gray-300 hover:text-signal-amber hover:bg-tunnel-600 transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-tunnel-700 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
