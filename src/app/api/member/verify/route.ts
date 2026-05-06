import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { memberId, mobileOtp } = await req.json();

  if (!memberId || !mobileOtp) {
    return NextResponse.json({ error: "OTP is required." }, { status: 400 });
  }

  const { data: otpRecord } = await supabase
    .from("member_otps")
    .select("*")
    .eq("member_id", memberId)
    .single();

  if (!otpRecord) {
    return NextResponse.json({ error: "OTP record not found. Please sign up again." }, { status: 404 });
  }

  if (new Date(otpRecord.expires_at) < new Date()) {
    return NextResponse.json({ error: "OTP has expired. Please sign up again." }, { status: 410 });
  }

  if (otpRecord.mobile_otp !== mobileOtp.trim()) {
    return NextResponse.json({ error: "Incorrect OTP. Please try again." }, { status: 400 });
  }

  // Mark member as verified
  await supabase.from("members").update({ mobile_verified: true }).eq("id", memberId);

  // Delete OTP record
  await supabase.from("member_otps").delete().eq("member_id", memberId);

  return NextResponse.json({ success: true });
}
