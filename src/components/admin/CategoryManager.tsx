"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Loader2, Folder, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category } from "@/types";

const TILE_LABELS = ["ELV", "ITS", "Auto", "Safety"];

export default function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [tileUpdating, setTileUpdating] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const slug = slugify(name);
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug, description: description.trim() || null })
      .select()
      .single();

    if (error) {
      toast.error(error.message.includes("unique") ? "Category already exists." : error.message);
    } else {
      toast.success("Category created.");
      setCategories([...categories, { ...data, post_count: 0, feature_tiles: [] }]);
      setName(""); setDescription("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Category deleted.");
      setCategories(categories.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  async function toggleTile(id: string, slot: number) {
    setTileUpdating(id + "-" + slot);
    const cat = categories.find((c) => c.id === id);
    const currentTiles: number[] = (cat as any)?.feature_tiles || [];
    const hasSlot = currentTiles.includes(slot);

    const newTiles = hasSlot
      ? currentTiles.filter((t) => t !== slot)
      : [...currentTiles, slot].sort();

    const { error } = await supabase.from("categories").update({ feature_tiles: newTiles }).eq("id", id);
    if (error) {
      toast.error("Failed to update tile.");
    } else {
      toast.success(hasSlot ? `Removed from Tile ${slot}` : `Added to Tile ${slot}`);
      setCategories(categories.map((c) => c.id === id ? { ...c, feature_tiles: newTiles } as any : c));
    }
    setTileUpdating(null);
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="tunnel-card p-4 border border-signal-amber/20 bg-signal-amber/5">
        <div className="flex items-start gap-3">
          <LayoutGrid className="w-4 h-4 text-signal-amber mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-signal-amber mb-1">Homepage Feature Tiles</p>
            <p className="text-xs text-gray-400">
              Toggle which tile slots each category appears in. A category can be linked to multiple tiles,
              and multiple categories can share the same tile slot.
            </p>
            <div className="flex gap-2 mt-2">
              {["1 · Tunnel ELV", "2 · ITS Solutions", "3 · Automation", "4 · Road Safety"].map((t) => (
                <span key={t} className="text-xs bg-tunnel-700 text-gray-400 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add form */}
        <div className="tunnel-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Add Category</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name *" required className="tunnel-input" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="tunnel-input" />
            <div className="flex items-center gap-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Add Category
              </button>
              {name && (
                <span className="text-xs text-gray-600">Slug: <span className="text-gray-400">{slugify(name)}</span></span>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="tunnel-card overflow-hidden">
          <div className="px-4 py-2 border-b border-tunnel-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Category</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tiles</span>
          </div>
          <div className="divide-y divide-tunnel-700">
            {categories.map((cat) => {
              const catTiles: number[] = (cat as any).feature_tiles || [];
              return (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-tunnel-700/40 transition-colors">
                  <Folder className="w-4 h-4 text-signal-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-200 font-medium truncate">{cat.name}</div>
                    <div className="text-xs text-gray-600">{cat.slug} · {(cat as any).post_count} posts</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4].map((slot) => {
                      const active = catTiles.includes(slot);
                      const busy = tileUpdating === cat.id + "-" + slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!!tileUpdating}
                          onClick={() => toggleTile(cat.id, slot)}
                          title={`Tile ${slot}`}
                          className={`w-10 h-7 rounded text-xs font-bold transition-all ${
                            active
                              ? "bg-signal-amber text-tunnel-900 border border-signal-amber"
                              : "bg-tunnel-700 text-gray-500 border border-tunnel-600 hover:border-signal-amber/40 hover:text-gray-300"
                          }`}
                        >
                          {busy ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : TILE_LABELS[slot - 1]}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {categories.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">No categories yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
