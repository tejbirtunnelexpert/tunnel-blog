import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-session";
import { createClient } from "@/lib/supabase/server";
import MemberDashboard from "@/components/member/MemberDashboard";

async function getData() {
  const supabase = await createClient();
  const [{ data: categories }, { data: files }] = await Promise.all([
    supabase.from("member_categories").select("*").order("sort_order"),
    supabase.from("member_files").select("*, category:member_categories(id, name)").order("created_at", { ascending: false }),
  ]);
  return {
    categories: categories || [],
    files: files || [],
  };
}

export default async function MemberPage() {
  const member = await getMemberSession();

  if (!member) redirect("/member/login");
  if (!member.approved) redirect("/member/pending");

  const { categories, files } = await getData();

  return <MemberDashboard member={member} categories={categories} files={files} />;
}
