import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { memberId, emailOtp, mobileOtp } = await req.json();

  if (!memberId || !emailOtp || !mobileOtp) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }

  const { data: otpRecord } = await supabase
    .from("member_otps")
    .select("*")
    .eq("member_id", memberId)
    .single();

  if (!otpRecord) {
    return NextResponse.json({ error: "OTP record not found. Please sign up again." }, { status: 404 });
  }

  // Check expiry
  if (new Date(otpRecord.expires_at) < new Date()) {
    return NextResponse.json({ error: "OTPs have expired. Please sign up again." }, { status: 410 });
  }

  const emailMatch = otpRecord.email_otp === emailOtp.trim();
  const mobileMatch = otpRecord.mobile_otp === mobileOtp.trim();

  if (!emailMatch && !mobileMatch) {
    return NextResponse.json({ error: "Both OTPs are incorrect." }, { status: 400 });
  }
  if (!emailMatch) {
    return NextResponse.json({ error: "Email OTP is incorrect." }, { status: 400 });
  }
  if (!mobileMatch) {
    return NextResponse.json({ error: "Mobile OTP is incorrect." }, { status: 400 });
  }

  // Mark member as verified
  await supabase.from("members").update({
    email_verified: true,
    mobile_verified: true,
  }).eq("id", memberId);

  // Delete OTP record
  await supabase.from("member_otps").delete().eq("member_id", memberId);

  return NextResponse.json({ success: true });
}
