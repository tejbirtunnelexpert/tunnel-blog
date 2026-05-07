import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("member_files")
    .select("*, category:member_categories(id, name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ files: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();
  const { title, description, categoryId, filePath, fileName, fileSize, fileType } = body;

  if (!title || !categoryId || !filePath) {
    return NextResponse.json({ error: "Title, category and filePath are required." }, { status: 400 });
  }

  const { data: { publicUrl } } = adminClient.storage
    .from("member-files")
    .getPublicUrl(filePath);

  const { data, error } = await supabase.from("member_files").insert({
    title,
    description: description || null,
    category_id: parseInt(categoryId),
    file_url: publicUrl,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
