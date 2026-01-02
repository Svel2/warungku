import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
    const supabase = await createClient();

    const { data: products } = await supabase
        .from("products")
        .select("*, category:categories(id, name)")
        .order("created_at", { ascending: false });

    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    return (
        <ProductsClient
            initialProducts={products || []}
            categories={categories || []}
        />
    );
}
