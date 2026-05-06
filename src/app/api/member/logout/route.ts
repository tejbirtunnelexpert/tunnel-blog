import { NextResponse } from "next/server";
import { MEMBER_COOKIE } from "@/lib/member-session";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(MEMBER_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
