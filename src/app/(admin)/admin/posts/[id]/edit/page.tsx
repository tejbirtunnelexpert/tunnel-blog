import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/PostForm";

async function getPost(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      categories:post_categories(category:categories(id, name, slug)),
      tags:post_tags(tag:tags(id, name, slug))
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    categories: data.categories?.map((c: any) => c.category).filter(Boolean) || [],
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
  };
}

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data || [];
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPost(id), getCategories()]);
  if (!post) notFound();
  return <PostForm post={post} categories={categories} mode="edit" />;
}
