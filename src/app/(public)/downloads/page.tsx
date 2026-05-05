import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Download, FolderOpen, FileText } from "lucide-react";

export const revalidate = 60;

export default async function DownloadsPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("download_categories")
    .select("*, downloads(count)")
    .order("name");

  const cats = categories?.map((c: any) => ({
    ...c,
    download_count: c.downloads?.[0]?.count || 0,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-signal-amber text-sm font-medium mb-3">
          <Download className="w-4 h-4" />
          Resource Library
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Downloads</h1>
        <p className="text-gray-400 max-w-2xl">
          Access technical presentations, guides, standards, and resources related to Tunnel ELV, ITS, and road automation.
        </p>
      </div>

      {cats.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No download categories yet.</p>
          <p className="text-sm mt-1">Check back soon for resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/downloads/${cat.slug}`}
              className="group bg-tunnel-800 border border-tunnel-600 rounded-xl overflow-hidden hover:border-signal-amber/40 transition-all hover:shadow-lg hover:shadow-signal-amber/5"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-tunnel-900 overflow-hidden">
                {cat.thumbnail_url ? (
                  <img
                    src={cat.thumbnail_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-16 h-16 text-tunnel-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-tunnel-900/80 to-transparent" />
                <div className="absolute bottom-3 right-3 bg-signal-amber/20 border border-signal-amber/30 text-signal-amber text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {cat.download_count} file{cat.download_count !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="font-semibold text-white text-lg mb-1.5 group-hover:text-signal-amber transition-colors">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-gray-400 text-sm line-clamp-2">{cat.description}</p>
                )}
                <div className="mt-4 flex items-center text-signal-amber text-sm font-medium">
                  <Download className="w-4 h-4 mr-1.5" />
                  Browse files →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
