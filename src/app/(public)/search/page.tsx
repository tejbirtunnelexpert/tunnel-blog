"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostCard from "@/components/blog/PostCard";
import { Search, Loader2 } from "lucide-react";
import type { Post } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) { setPosts([]); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = searchParams.get("q");
    if (initial) doSearch(initial);
  }, [searchParams, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch(query);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-6">Search Articles</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title, keyword, or topic…"
            className="tunnel-input pl-9 text-base"
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>

      {loading && (
        <div className="flex items-center gap-3 text-gray-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-signal-amber" />
          Searching…
        </div>
      )}

      {!loading && searched && posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">No results found for &quot;{query}&quot;</p>
          <p className="text-sm">Try a different keyword or browse by category.</p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-5">{posts.length} result{posts.length !== 1 ? "s" : ""} for &quot;{query}&quot;</p>
          <div className="space-y-4">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 text-gray-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-signal-amber" />
          Loading search…
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
