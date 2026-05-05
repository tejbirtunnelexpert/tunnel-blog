import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/PostForm";

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data || [];
}

export default async function NewPostPage() {
  const categories = await getCategories();
  return <PostForm categories={categories} mode="new" />;
}
