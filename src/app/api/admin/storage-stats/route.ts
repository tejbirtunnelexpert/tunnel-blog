import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STORAGE_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB Supabase free
const BANDWIDTH_LIMIT = 5 * 1024 * 1024 * 1024; // 5 GB/month

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: files } = await supabase
    .from("member_files")
    .select("file_size");

  const usedBytes = files?.reduce((sum, f) => sum + (f.file_size || 0), 0) || 0;
  const fileCount = files?.length || 0;

  return NextResponse.json({
    storage: {
      used: usedBytes,
      limit: STORAGE_LIMIT,
      free: STORAGE_LIMIT - usedBytes,
      pct: Math.min(100, (usedBytes / STORAGE_LIMIT) * 100),
      fileCount,
    },
    bandwidth: {
      limit: BANDWIDTH_LIMIT,
      note: "Check Supabase Dashboard for actual bandwidth usage",
      dashboardUrl: "https://supabase.com/dashboard",
    }
  });
}
