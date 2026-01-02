import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/catalog/Navbar";
import Hero from "@/components/catalog/Hero";
import CategoryFilter from "@/components/catalog/CategoryFilter";
import ProductGrid from "@/components/catalog/ProductGrid";
import Footer from "@/components/layout/Footer";

export const revalidate = 60;

interface HomeProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  const { category: categoryFilter, search: searchQuery } = await searchParams;

  // Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch Products
  let productQuery = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("stock", { ascending: false });

  if (categoryFilter) {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryFilter)
      .single();

    if (catData) {
      productQuery = productQuery.eq("category_id", catData.id);
    }
  }

  if (searchQuery) {
    productQuery = productQuery.ilike("name", `%${searchQuery}%`);
  }

  const { data: products } = await productQuery;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <Hero />
      <CategoryFilter categories={categories || []} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-12">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10 flex items-end justify-between">
          <div>
            <p className="text-[var(--color-forest)] text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-1 sm:mb-2">
              Koleksi Kami
            </p>
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-[var(--color-charcoal)]">
              {categoryFilter || "Semua Produk"}
            </h2>
          </div>
          <p className="text-[var(--color-muted)] text-xs sm:text-sm">
            {products?.length || 0} item
          </p>
        </div>

        <ProductGrid products={products || []} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
