import { createClient } from "@/lib/supabase/server";
import CategoryManager from "@/components/admin/CategoryManager";

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*, post_count:post_categories(count)")
    .order("name");

  return data?.map((c: any) => ({
    ...c,
    post_count: c.post_count?.[0]?.count || 0,
  })) || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="text-sm text-gray-500">{categories.length} categories</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
