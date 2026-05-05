import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DownloadForm from "@/components/admin/DownloadForm";

export default async function EditDownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: download } = await supabase.from("downloads").select("*").eq("id", id).single();
  if (!download) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Edit Download</h1>
      <DownloadForm download={download} />
    </div>
  );
}
