import { createClient } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
    const supabase = await createClient();

    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

    // Get product counts per category
    const { data: productCounts } = await supabase
        .from("products")
        .select("category_id")
        .not("category_id", "is", null);

    const countMap: Record<string, number> = {};
    productCounts?.forEach((p) => {
        if (p.category_id) {
            countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
        }
    });

    return <CategoriesClient initialCategories={categories || []} productCounts={countMap} />;
}
