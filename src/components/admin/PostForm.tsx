"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, ArrowLeft, Loader2, X, Plus } from "lucide-react";
import toast from "react-hot-toast";
import type { Post, Category } from "@/types";
import { stripHtml, truncate } from "@/lib/utils";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

interface Props {
  post?: Post;
  categories: Category[];
  mode: "new" | "edit";
}

export default function PostForm({ post, categories, mode }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.cover_image || "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status || "draft");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post?.categories?.map((c) => c.id) || []
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post?.tags?.map((t) => t.name) || []);
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function autoExcerpt() {
    if (!excerpt && content) {
      setExcerpt(truncate(stripHtml(content), 200));
    }
  }

  async function handleSave(saveStatus: "draft" | "published") {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        title,
        content,
        excerpt: excerpt || truncate(stripHtml(content), 200),
        cover_image: coverImage || null,
        status: saveStatus,
        categories: selectedCategories,
        tags,
      };

      const url = mode === "new" ? "/api/posts" : `/api/posts/${post!.id}`;
      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(saveStatus === "published" ? "Post published!" : "Draft saved.");
        router.push("/admin/posts");
        router.refresh();
      } else {
        const d = await res.json();
        toast.error(d.error || "Save failed.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{mode === "new" ? "New Post" : "Edit Post"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave("draft")} disabled={saving} className="btn-secondary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button onClick={() => handleSave("published")} disabled={saving} className="btn-primary">
            <Eye className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title…"
            className="tunnel-input text-lg font-semibold py-3"
          />

          <RichEditor content={content} onChange={setContent} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="tunnel-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Status</h3>
            <div className="flex gap-2">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-1.5 rounded-md text-sm capitalize transition-colors ${
                    status === s
                      ? "bg-signal-amber/20 text-signal-amber border border-signal-amber/40"
                      : "bg-tunnel-700 text-gray-400 border border-tunnel-600 hover:bg-tunnel-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Cover image */}
          <div className="tunnel-card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Cover Image URL</h3>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://…"
              className="tunnel-input"
            />
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="Cover preview" className="w-full h-28 object-cover rounded-md border border-tunnel-600 mt-2" onError={(e) => (e.currentTarget.style.display = "none")} />
            )}
          </div>

          {/* Excerpt */}
          <div className="tunnel-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Excerpt</h3>
              <button type="button" onClick={autoExcerpt} className="text-xs text-signal-amber hover:underline">Auto</button>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary for previews…"
              rows={3}
              className="tunnel-input resize-none"
            />
          </div>

          {/* Categories */}
          <div className="tunnel-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Categories</h3>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-3.5 h-3.5 accent-signal-amber"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="tunnel-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tags</h3>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…"
                className="tunnel-input flex-1"
              />
              <button type="button" onClick={addTag} className="btn-secondary px-2.5">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="cyan-badge gap-1">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
