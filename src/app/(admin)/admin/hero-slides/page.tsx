"use client";

import { useEffect, useState, useRef } from "react";
import { ImageIcon, Plus, Trash2, Loader2, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Slide {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  active: boolean;
  position: string;
  opacity: number;
  show_caption: boolean;
}

const defaultSlide = (): Partial<Slide> => ({
  image_url: "",
  caption: "",
  position: "50% 50%",
  opacity: 80,
  show_caption: true,
  active: true,
});

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSlide, setNewSlide] = useState(defaultSlide());
  const [editForm, setEditForm] = useState<Partial<Slide>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/hero-slides/all");
    const data = await res.json();
    setSlides(data.slides || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadImage(file: File, onDone: (url: string) => void) {
    const toastId = toast.loading("Uploading image…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "bog_images");
      const res = await fetch("/api/upload-file", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(data.url);
      toast.success("Image ready!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    }
  }

  // Interactive position picker — click on image to set focal point
  function handlePositionClick(e: React.MouseEvent<HTMLDivElement>, setter: (pos: string) => void) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setter(`${x}% ${y}%`);
  }

  function posToPercent(pos: string): { x: number; y: number } {
    const parts = (pos || "50% 50%").split(" ");
    return {
      x: parseFloat(parts[0]) || 50,
      y: parseFloat(parts[1]) || 50,
    };
  }

  async function handleAdd() {
    if (!newSlide.image_url) { toast.error("Please upload an image first"); return; }
    const res = await fetch("/api/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newSlide, sort_order: slides.length }),
    });
    if (res.ok) {
      toast.success("Slide added!");
      setNewSlide(defaultSlide());
      if (fileRef.current) fileRef.current.value = "";
      load();
    } else {
      const d = await res.json();
      toast.error(d.error || "Failed to add");
    }
  }

  async function handleSaveEdit(slide: Slide) {
    const res = await fetch(`/api/hero-slides/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...slide, ...editForm }),
    });
    if (res.ok) {
      toast.success("Saved!");
      setEditingId(null);
      load();
    } else toast.error("Failed to save");
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
    if (res.ok) {
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, active: !s.active } : s));
      toast.success(slide.active ? "Hidden" : "Shown");
    }
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

  function startEdit(slide: Slide) {
    setEditingId(slide.id);
    setEditForm({
      image_url: slide.image_url,
      caption: slide.caption || "",
      position: slide.position || "50% 50%",
      opacity: slide.opacity ?? 80,
      show_caption: slide.show_caption ?? true,
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hero Slideshow</h1>
        <p className="text-gray-400 text-sm mt-1">Manage background images for the homepage hero</p>
      </div>

      {/* ── ADD NEW SLIDE ── */}
      <div className="bg-tunnel-800 border border-tunnel-600 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
          <Plus className="w-5 h-5 text-signal-amber" /> Add New Slide
        </h2>

        {/* Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Background Image *</label>
          {newSlide.image_url ? (
            <div className="relative mb-2">
              {/* Interactive position picker */}
              <div
                className="relative w-full h-44 rounded-lg overflow-hidden border-2 border-signal-amber/50 cursor-crosshair"
                onClick={e => handlePositionClick(e, pos => setNewSlide(f => ({ ...f, position: pos })))}
                title="Click to set focal point"
              >
                <img src={newSlide.image_url} alt="" className="w-full h-full object-cover"
                  style={{ objectPosition: newSlide.position, opacity: (newSlide.opacity ?? 80) / 100 }} />
                {/* Focal point dot */}
                <div className="absolute w-5 h-5 rounded-full border-2 border-signal-amber bg-signal-amber/30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${posToPercent(newSlide.position || "50% 50%").x}%`, top: `${posToPercent(newSlide.position || "50% 50%").y}%` }} />
                <div className="absolute top-2 left-2 bg-tunnel-900/80 text-xs text-signal-amber px-2 py-1 rounded">
                  👆 Click image to set focal point
                </div>
              </div>
              <button onClick={() => setNewSlide(f => ({ ...f, image_url: "" }))}
                className="absolute top-2 right-2 bg-tunnel-900/80 text-gray-300 hover:text-red-400 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-tunnel-600 rounded-lg cursor-pointer hover:border-signal-amber/50 transition-colors mb-2">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin text-signal-amber mb-2" /> : <Upload className="w-8 h-8 text-gray-500 mb-2" />}
              <span className="text-sm text-gray-400">{uploading ? "Uploading…" : "Click to upload image"}</span>
              <span className="text-xs text-gray-600 mt-1">JPG, PNG — recommended 1920×600px</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setUploading(true); uploadImage(f, url => { setNewSlide(n => ({ ...n, image_url: url })); setUploading(false); }); if (fileRef.current) fileRef.current.value = ""; } }} />
            </label>
          )}
          <input value={newSlide.image_url || ""} onChange={e => setNewSlide(f => ({ ...f, image_url: e.target.value }))}
            placeholder="Or paste image URL…" className="tunnel-input text-sm" />
        </div>

        {/* Opacity */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image Opacity — <span className="text-signal-amber">{newSlide.opacity ?? 80}%</span>
          </label>
          <input type="range" min={20} max={100} value={newSlide.opacity ?? 80}
            onChange={e => setNewSlide(f => ({ ...f, opacity: parseInt(e.target.value) }))}
            className="w-full accent-signal-amber" />
          <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Darker</span><span>Brighter</span></div>
        </div>

        {/* Caption */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Caption</label>
            <button onClick={() => setNewSlide(f => ({ ...f, show_caption: !f.show_caption }))}
              className={`text-xs px-2 py-1 rounded border transition-colors ${newSlide.show_caption ? "border-signal-amber text-signal-amber" : "border-tunnel-600 text-gray-500"}`}>
              {newSlide.show_caption ? "Visible" : "Hidden"}
            </button>
          </div>
          <input value={newSlide.caption || ""} onChange={e => setNewSlide(f => ({ ...f, caption: e.target.value }))}
            placeholder="e.g. Tunnel ELV Control Room — Project 2024" className="tunnel-input" />
        </div>

        <button onClick={handleAdd} disabled={!newSlide.image_url || uploading} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      {/* ── CURRENT SLIDES ── */}
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
        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`bg-tunnel-800 border rounded-xl overflow-hidden ${slide.active ? "border-tunnel-600" : "border-tunnel-700 opacity-60"}`}>

              {/* Slide header row */}
              <div className="flex items-center gap-4 p-3">
                <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0">
                  <img src={slide.image_url} alt="" className="w-full h-full object-cover"
                    style={{ objectPosition: slide.position || "50% 50%" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{slide.caption || "No caption"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Slide {i + 1} • {slide.active ? "Visible" : "Hidden"} • Opacity {slide.opacity ?? 80}%
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveSlide(i, "up")} disabled={i === 0}
                    className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveSlide(i, "down")} disabled={i === slides.length - 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => editingId === slide.id ? setEditingId(null) : startEdit(slide)}
                    className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(slide)}
                    className="p-2 rounded-lg text-gray-400 hover:text-signal-amber hover:bg-tunnel-700 transition-colors">
                    {slide.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(slide.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Edit panel */}
              {editingId === slide.id && (
                <div className="border-t border-tunnel-700 p-4 space-y-4 bg-tunnel-900/40">

                  {/* Interactive position picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      📍 Click on image to set focal point
                    </label>
                    <div
                      className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-signal-amber/40 cursor-crosshair"
                      onClick={e => handlePositionClick(e, pos => setEditForm(f => ({ ...f, position: pos })))}
                    >
                      <img src={editForm.image_url || slide.image_url} alt="" className="w-full h-full object-cover"
                        style={{ objectPosition: editForm.position || "50% 50%", opacity: (editForm.opacity ?? 80) / 100 }} />
                      {/* Focal point dot */}
                      <div className="absolute w-6 h-6 rounded-full border-2 border-signal-amber bg-signal-amber/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg"
                        style={{ left: `${posToPercent(editForm.position || "50% 50%").x}%`, top: `${posToPercent(editForm.position || "50% 50%").y}%` }} />
                      <div className="absolute top-2 left-2 bg-tunnel-900/80 text-xs text-signal-amber px-2 py-1 rounded">
                        👆 Click to reposition
                      </div>
                    </div>
                    {/* Replace image */}
                    <label className="inline-flex items-center gap-2 mt-2 text-xs text-gray-400 cursor-pointer hover:text-signal-amber">
                      <Upload className="w-3.5 h-3.5" /> Replace image
                      <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, url => setEditForm(ef => ({ ...ef, image_url: url }))); if (editFileRef.current) editFileRef.current.value = ""; }} />
                    </label>
                  </div>

                  {/* Opacity slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image Opacity — <span className="text-signal-amber">{editForm.opacity ?? 80}%</span>
                    </label>
                    <input type="range" min={20} max={100} value={editForm.opacity ?? 80}
                      onChange={e => setEditForm(f => ({ ...f, opacity: parseInt(e.target.value) }))}
                      className="w-full accent-signal-amber" />
                    <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Darker</span><span>Brighter</span></div>
                  </div>

                  {/* Caption */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-300">Caption</label>
                      <button onClick={() => setEditForm(f => ({ ...f, show_caption: !f.show_caption }))}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${editForm.show_caption ? "border-signal-amber text-signal-amber" : "border-tunnel-600 text-gray-500"}`}>
                        {editForm.show_caption ? "Visible" : "Hidden"}
                      </button>
                    </div>
                    <input value={editForm.caption || ""} onChange={e => setEditForm(f => ({ ...f, caption: e.target.value }))}
                      placeholder="Caption text…" className="tunnel-input" />
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveEdit(slide)} className="btn-primary flex items-center gap-2">
                      <Check className="w-4 h-4" /> Save Changes
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
