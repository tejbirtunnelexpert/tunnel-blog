import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const MEMBER_COOKIE = "member_session";

export interface MemberSession {
  id: string;
  name: string;
  email: string;
  mobile: string;
  company: string | null;
  position: string | null;
  approved: boolean;
}

export async function getMemberSession(): Promise<MemberSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(MEMBER_COOKIE)?.value;
    if (!token) return null;

    const supabase = await createClient();
    const { data } = await supabase
      .from("members")
      .select("id, name, email, mobile, company, position, approved")
      .eq("session_token", token)
      .single();

    return data || null;
  } catch {
    return null;
  }
}
