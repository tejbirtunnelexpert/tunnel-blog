"use client";

import { useEffect, useState, useRef } from "react";
import { ImageIcon, Plus, Trash2, Loader2, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface Slide {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  active: boolean;
  position: string;
}

const POSITIONS = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [newPosition, setNewPosition] = useState("center");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/hero-slides/all");
    const data = await res.json();
    setSlides(data.slides || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    const toastId = toast.loading("Uploading image…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "bog_images");
      const res = await fetch("/api/upload-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreviewUrl(data.url);
      toast.success("Image ready!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleAdd() {
    if (!previewUrl) { toast.error("Please upload an image first"); return; }
    const res = await fetch("/api/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: previewUrl, caption, sort_order: slides.length, position: newPosition }),
    });
    if (res.ok) {
      toast.success("Slide added!");
      setPreviewUrl("");
      setCaption("");
      setNewPosition("center");
      load();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed to add");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this slide?")) return;
    const res = await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); load(); }
    else toast.error("Failed to delete");
  }

  async function toggleActive(slide: Slide) {
    const res = await fetch(`/api/hero-slides/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...slide, active: !slide.active }),
    });
    if (res.ok) { toast.success(slide.active ? "Hidden" : "Shown"); load(); }
  }

  async function changePosition(slide: Slide, position: string) {
    const updated = { ...slide, position };
    setSlides(prev => prev.map(s => s.id === slide.id ? updated : s));
    const res = await fetch(`/api/hero-slides/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) toast.success("Position updated!");
    else toast.error("Failed to update position");
  }

  async function moveSlide(index: number, dir: "up" | "down") {
    const newSlides = [...slides];
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newSlides.length) return;
    [newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]];
    setSlides(newSlides);
    try {
      await Promise.all(newSlides.map((s, i) =>
        fetch(`/api/hero-slides/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...s, sort_order: i }),
        })
      ));
      toast.success("Order saved!");
    } catch {
      toast.error("Failed to save order");
      load();
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hero Slideshow</h1>
        <p className="text-gray-400 text-sm mt-1">Manage background images for the homepage hero section</p>
      </div>

      {/* Add new slide */}
      <div className="bg-tunnel-800 border border-tunnel-600 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-signal-amber" /> Add New Slide
        </h2>

        {/* Image upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Background Image *</label>
          {previewUrl ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-tunnel-600">
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" style={{ objectPosition: newPosition }} />
              <button onClick={() => setPreviewUrl("")} className="absolute top-2 right-2 bg-tunnel-900/80 text-gray-300 hover:text-red-400 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-tunnel-600 rounded-lg cursor-pointer hover:border-signal-amber/50 transition-colors">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin text-signal-amber mb-2" /> : <Upload className="w-8 h-8 text-gray-500 mb-2" />}
              <span className="text-sm text-gray-400">{uploading ? "Uploading…" : "Click to upload image"}</span>
              <span className="text-xs text-gray-600 mt-1">JPG, PNG — recommended 1920×600px</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            </label>
          )}
          <input value={previewUrl} onChange={e => setPreviewUrl(e.target.value)}
            placeholder="Or paste image URL…" className="tunnel-input text-sm mt-2" />
        </div>

        {/* Position selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Image Position</label>
          <div className="flex gap-2">
            {POSITIONS.map(p => (
              <button key={p.value} type="button" onClick={() => setNewPosition(p.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  newPosition === p.value
                    ? "bg-signal-amber/20 border-signal-amber text-signal-amber"
                    : "bg-tunnel-900 border-tunnel-600 text-gray-400 hover:text-gray-200"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">Caption (optional)</label>
          <input value={caption} onChange={e => setCaption(e.target.value)}
            placeholder="e.g. Tunnel ELV Control Room — Project 2024" className="tunnel-input" />
        </div>

        <button onClick={handleAdd} disabled={!previewUrl || uploading} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {/* Slides list */}
      <h2 className="text-lg font-semibold text-white mb-4">Current Slides ({slides.length})</h2>
      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-signal-amber" /> Loading…
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No slides yet. Add your first image above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`bg-tunnel-800 border rounded-xl overflow-hidden p-3 ${slide.active ? "border-tunnel-600" : "border-tunnel-700 opacity-60"}`}>
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={slide.image_url} alt="" className="w-full h-full object-cover"
                    style={{ objectPosition: slide.position || "center" }} />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{slide.caption || "No caption"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Slide {i + 1} • {slide.active ? "Visible" : "Hidden"} • Position: {slide.position || "center"}</p>
                </div>
                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveSlide(i, "up")} disabled={i === 0} className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveSlide(i, "down")} disabled={i === slides.length - 1} className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(slide)} className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors">
                    {slide.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Position buttons per slide */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-tunnel-700">
                <span className="text-xs text-gray-500 self-center mr-1">Position:</span>
                {POSITIONS.map(p => (
                  <button key={p.value} onClick={() => changePosition(slide, p.value)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                      (slide.position || "center") === p.value
                        ? "bg-signal-amber/20 border-signal-amber text-signal-amber"
                        : "bg-tunnel-900 border-tunnel-600 text-gray-400 hover:text-gray-200"
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
