import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-session";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const member = await getMemberSession();
  if (!member || !member.approved) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_files")
    .select("*, category:member_categories(id, name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ files: data });
}
