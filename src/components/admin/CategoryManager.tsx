"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Loader2, Folder, LayoutGrid } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category } from "@/types";

const TILE_SLOTS = [
  { value: "", label: "— No tile —" },
  { value: "1", label: "Tile 1 · Tunnel ELV" },
  { value: "2", label: "Tile 2 · ITS Solutions" },
  { value: "3", label: "Tile 3 · Automation" },
  { value: "4", label: "Tile 4 · Road Safety" },
];

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
      setCategories([...categories, { ...data, post_count: 0 }]);
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

  async function handleTileChange(id: string, value: string) {
    setTileUpdating(id);
    const feature_order = value === "" ? null : parseInt(value);

    // If assigning a slot, clear it from any other category first
    if (feature_order !== null) {
      const existing = categories.find((c) => (c as any).feature_order === feature_order && c.id !== id);
      if (existing) {
        await supabase.from("categories").update({ feature_order: null }).eq("id", existing.id);
      }
    }

    const { error } = await supabase.from("categories").update({ feature_order }).eq("id", id);
    if (error) {
      toast.error("Failed to update tile.");
    } else {
      toast.success(feature_order ? `Linked to Tile ${feature_order}` : "Tile link removed.");
      setCategories(categories.map((c) => {
        if ((c as any).feature_order === feature_order && c.id !== id) return { ...c, feature_order: null } as any;
        if (c.id === id) return { ...c, feature_order } as any;
        return c;
      }));
      router.refresh();
    }
    setTileUpdating(null);
  }

  return (
    <div className="space-y-6">
      {/* Homepage tile assignment info */}
      <div className="tunnel-card p-4 border border-signal-amber/20 bg-signal-amber/5">
        <div className="flex items-start gap-3">
          <LayoutGrid className="w-4 h-4 text-signal-amber mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-signal-amber mb-1">Homepage Feature Tiles</p>
            <p className="text-xs text-gray-400">Assign each category to a homepage tile slot using the dropdown. The tile on the homepage will link to that category's articles.</p>
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
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Homepage Tile</span>
          </div>
          <div className="divide-y divide-tunnel-700">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-tunnel-700/40 transition-colors">
                <Folder className="w-4 h-4 text-signal-amber shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 font-medium truncate">{cat.name}</div>
                  <div className="text-xs text-gray-600">{cat.slug} · {(cat as any).post_count} posts</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {tileUpdating === cat.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-signal-amber" />
                  ) : (
                    <select
                      value={(cat as any).feature_order?.toString() || ""}
                      onChange={(e) => handleTileChange(cat.id, e.target.value)}
                      className="tunnel-input text-xs py-1 px-2 h-auto w-44"
                    >
                      {TILE_SLOTS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">No categories yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
