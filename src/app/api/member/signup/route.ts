import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { name, email, mobile, password, company, position } = body;

  if (!name || !email || !mobile || !password) {
    return NextResponse.json({ error: "Name, email, mobile and password are required." }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Validate mobile — exactly 10 digits
  const mobileClean = mobile.replace(/[\s\-\+]/g, "").replace(/^91/, "");
  if (!/^\d{10}$/.test(mobileClean)) {
    return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  // Check duplicate email
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  // Create member — mark as verified immediately (no OTP)
  const { data: member, error } = await supabase
    .from("members")
    .insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobileClean,
      password,
      company: company?.trim() || null,
      position: position?.trim() || null,
      email_verified: true,
      mobile_verified: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, memberId: member.id }, { status: 201 });
}
