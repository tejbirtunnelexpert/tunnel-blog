import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const approved = searchParams.get("approved");

  let query = supabase
    .from("comments")
    .select("*, post:posts(title, slug)")
    .order("created_at", { ascending: false });

  if (approved === "false") query = query.eq("approved", false);
  else if (approved === "true") query = query.eq("approved", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { post_id, author_name, author_email, content } = body;

  if (!post_id || !author_name || !author_email || !content) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(author_email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id, author_name, author_email: author_email.toLowerCase(), content, approved: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
