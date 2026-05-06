import { NextResponse } from "next/server";
import { getMemberSession } from "@/lib/member-session";

export async function GET() {
  const member = await getMemberSession();
  if (!member) return NextResponse.json({ member: null });
  return NextResponse.json({ member });
}
