"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Loader2, Folder } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category } from "@/types";

export default function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
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
        <div className="divide-y divide-tunnel-700">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-tunnel-700/40 transition-colors">
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4 text-signal-amber shrink-0" />
                <div>
                  <div className="text-sm text-gray-200 font-medium">{cat.name}</div>
                  <div className="text-xs text-gray-600">{cat.slug} · {cat.post_count} posts</div>
                </div>
              </div>
              <button onClick={() => handleDelete(cat.id)}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">No categories yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
