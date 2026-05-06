import { NextRequest, NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-session";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const member = await getMemberSession();
  if (!member || !member.approved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await adminClient.storage
    .from("member-files")
    .upload(fileName, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = adminClient.storage.from("member-files").getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl, name: file.name, size: file.size, type: file.type });
}
