"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileText, ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import type { Download, DownloadCategory } from "@/types";

interface Props {
  download?: Download;
}

export default function DownloadForm({ download }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: download?.title || "",
    description: download?.description || "",
    file_url: download?.file_url || "",
    thumbnail_url: download?.thumbnail_url || "",
    category_id: download?.category_id || "",
    file_size: download?.file_size || "",
  });

  useEffect(() => {
    fetch("/api/download-categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  async function uploadFile(file: File, bucket: string, fieldKey: "file_url" | "thumbnail_url", setLoading: (v: boolean) => void) {
    setLoading(true);
    const toastId = toast.loading("Uploading…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      const res = await fetch("/api/upload-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm(f => ({ ...f, [fieldKey]: data.url }));
      toast.success("Uploaded!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.file_url) { toast.error("Title and PDF file are required"); return; }
    setSaving(true);
    try {
      const url = download ? `/api/downloads/${download.id}` : "/api/downloads";
      const method = download ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success(download ? "Updated!" : "Download added!");
      router.push("/admin/downloads");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Tunnel ELV Systems Overview"
          className="tunnel-input"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Brief description of this file…"
          rows={3}
          className="tunnel-input resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
        <select
          value={form.category_id}
          onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
          className="tunnel-input"
        >
          <option value="">— No category —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">PDF File *</label>
        {form.file_url ? (
          <div className="flex items-center gap-3 p-3 bg-tunnel-900 border border-tunnel-600 rounded-lg">
            <FileText className="w-5 h-5 text-signal-amber shrink-0" />
            <span className="text-sm text-gray-300 truncate flex-1">File uploaded ✓</span>
            <button type="button" onClick={() => setForm(f => ({ ...f, file_url: "" }))} className="text-gray-500 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-tunnel-600 rounded-lg cursor-pointer hover:border-signal-amber/50 transition-colors">
            {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin text-signal-amber" /> : <Upload className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm text-gray-300 font-medium">Click to upload PDF</p>
              <p className="text-xs text-gray-500">Max 20MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f, "downloads", "file_url", setUploadingFile);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </label>
        )}
        {/* Or paste URL */}
        <div className="mt-2">
          <input
            value={form.file_url}
            onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
            placeholder="Or paste a direct file URL…"
            className="tunnel-input text-sm"
          />
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Thumbnail Image</label>
        {form.thumbnail_url ? (
          <div className="flex items-start gap-3">
            <img src={form.thumbnail_url} alt="thumbnail" className="w-24 h-16 object-cover rounded-lg border border-tunnel-600" />
            <button type="button" onClick={() => setForm(f => ({ ...f, thumbnail_url: "" }))} className="text-gray-500 hover:text-red-400 mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-tunnel-600 rounded-lg cursor-pointer hover:border-signal-amber/50 transition-colors">
            {uploadingThumb ? <Loader2 className="w-5 h-5 animate-spin text-signal-amber" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm text-gray-300 font-medium">Click to upload thumbnail</p>
              <p className="text-xs text-gray-500">JPG, PNG — Max 5MB</p>
            </div>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f, "bog_images", "thumbnail_url", setUploadingThumb);
                if (thumbInputRef.current) thumbInputRef.current.value = "";
              }}
            />
          </label>
        )}
        <div className="mt-2">
          <input
            value={form.thumbnail_url}
            onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
            placeholder="Or paste image URL…"
            className="tunnel-input text-sm"
          />
        </div>
      </div>

      {/* File Size */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">File Size (optional)</label>
        <input
          value={form.file_size}
          onChange={e => setForm(f => ({ ...f, file_size: e.target.value }))}
          placeholder="e.g. 2.4 MB"
          className="tunnel-input"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {download ? "Update Download" : "Add Download"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
