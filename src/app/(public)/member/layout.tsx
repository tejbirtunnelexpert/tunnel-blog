import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-session";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const member = await getMemberSession();

  // These pages are public within /member
  return <>{children}</>;
}
