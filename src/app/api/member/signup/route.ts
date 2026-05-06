import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmailOTP, sendSMSOTP } from "@/lib/send-otp";

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

  // Generate OTPs
  const emailOtp = gen4();
  const mobileOtp = gen4();

  // Store OTPs (delete any old ones first)
  await supabase.from("member_otps").delete().eq("member_id", member.id);
  await supabase.from("member_otps").insert({
    member_id: member.id,
    email_otp: emailOtp,
    mobile_otp: mobileOtp,
  });

  // Send OTPs
  const [emailResult, smsResult] = await Promise.all([
    sendEmailOTP(member.email, emailOtp, member.name),
    sendSMSOTP(member.mobile, mobileOtp),
  ]);

  // If API keys not configured, return OTPs in response for testing
  const devMode = emailResult.dev || smsResult.dev;

  return NextResponse.json({
    success: true,
    memberId: member.id,
    ...(devMode && {
      _dev: {
        note: "OTP keys not configured — OTPs shown here for testing only.",
        emailOtp,
        mobileOtp,
      },
    }),
  }, { status: 201 });
}
