import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, FileText, ArrowLeft, FolderOpen } from "lucide-react";

export const revalidate = 60;

export default async function CategoryDownloadsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("download_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: downloads } = await supabase
    .from("downloads")
    .select("*")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Back */}
      <Link href="/downloads" className="inline-flex items-center gap-2 text-gray-400 hover:text-signal-amber text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        All Categories
      </Link>

      {/* Category header */}
      <div className="rounded-xl overflow-hidden bg-tunnel-800 border border-tunnel-600 mb-10">
        {category.thumbnail_url ? (
          <div className="relative h-48">
            <img src={category.thumbnail_url} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-tunnel-900/90 to-tunnel-900/40" />
            <div className="absolute inset-0 flex items-center px-8">
              <div>
                <div className="flex items-center gap-2 text-signal-amber text-sm font-medium mb-2">
                  <FolderOpen className="w-4 h-4" />
                  Download Category
                </div>
                <h1 className="text-3xl font-bold text-white">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-300 mt-2 max-w-xl">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 text-signal-amber text-sm font-medium mb-2">
              <FolderOpen className="w-4 h-4" />
              Download Category
            </div>
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            {category.description && (
              <p className="text-gray-400 mt-2">{category.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Downloads grid */}
      {!downloads || downloads.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No files in this category yet.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{downloads.length} file{downloads.length !== 1 ? "s" : ""} available</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((dl: any) => (
              <div
                key={dl.id}
                className="bg-tunnel-800 border border-tunnel-600 rounded-xl overflow-hidden hover:border-signal-amber/40 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-tunnel-900">
                  {dl.thumbnail_url ? (
                    <img
                      src={dl.thumbnail_url}
                      alt={dl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-14 h-14 text-tunnel-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-tunnel-900/60 to-transparent" />
                  {dl.file_size && (
                    <div className="absolute top-3 right-3 bg-tunnel-900/80 text-gray-300 text-xs px-2 py-1 rounded">
                      {dl.file_size}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-1.5 group-hover:text-signal-amber transition-colors line-clamp-2">
                    {dl.title}
                  </h3>
                  {dl.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{dl.description}</p>
                  )}
                  <a
                    href={dl.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 bg-signal-amber text-tunnel-950 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-signal-amber/90 transition-colors w-full justify-center"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
