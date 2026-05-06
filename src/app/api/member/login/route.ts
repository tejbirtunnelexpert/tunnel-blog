import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MEMBER_COOKIE } from "@/lib/member-session";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!member) {
    return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
  }

  if (member.password !== password) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  if (!member.email_verified || !member.mobile_verified) {
    return NextResponse.json({ error: "Please verify your email and mobile OTP first.", code: "NOT_VERIFIED" }, { status: 403 });
  }

  if (!member.approved) {
    return NextResponse.json({ error: "Your account is pending admin approval.", code: "PENDING" }, { status: 403 });
  }

  // Create session token
  const sessionToken = randomUUID();
  await supabase.from("members").update({ session_token: sessionToken }).eq("id", member.id);

  const res = NextResponse.json({ success: true });
  res.cookies.set(MEMBER_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
