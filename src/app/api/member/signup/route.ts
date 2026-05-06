import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSMSOTP } from "@/lib/send-otp";

function gen4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { name, email, mobile, password, company, position } = body;

  if (!name || !email || !mobile || !password) {
    return NextResponse.json({ error: "Name, email, mobile and password are required." }, { status: 400 });
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

  // Create member
  const { data: member, error } = await supabase
    .from("members")
    .insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password, // stored plain — visible to admin by design
      company: company?.trim() || null,
      position: position?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate mobile OTP only
  const mobileOtp = gen4();

  // Store OTP (delete any old ones first)
  await supabase.from("member_otps").delete().eq("member_id", member.id);
  await supabase.from("member_otps").insert({
    member_id: member.id,
    email_otp: "0000", // not used
    mobile_otp: mobileOtp,
  });

  // Auto-mark email as verified (no email OTP required)
  await supabase.from("members").update({ email_verified: true }).eq("id", member.id);

  // Send SMS OTP
  const smsResult = await sendSMSOTP(member.mobile, mobileOtp);

  return NextResponse.json({
    success: true,
    memberId: member.id,
    // Show OTP on screen if: dev mode (no key) OR SMS failed
    ...((smsResult.dev || !smsResult.ok) && {
      _dev: {
        note: smsResult.dev
          ? "FAST2SMS_API_KEY not configured — OTP shown here for testing only."
          : `SMS failed: ${(smsResult as any).error || "Unknown error"} — OTP shown here as fallback.`,
        mobileOtp,
      },
    }),
  }, { status: 201 });
}
