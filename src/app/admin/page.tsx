import { createClient } from "@/lib/supabase/server";
import { Package, FolderOpen, AlertTriangle, TrendingUp } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch stats
    const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

    const { count: totalCategories } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

    const { data: lowStockProducts } = await supabase
        .from("products")
        .select("id, name, stock")
        .lt("stock", 5)
        .eq("is_active", true);

    const { data: recentProducts } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Dashboard
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Selamat datang di Admin Panel WarungKu
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Produk"
                    value={totalProducts || 0}
                    icon={Package}
                />
                <StatsCard
                    title="Kategori"
                    value={totalCategories || 0}
                    icon={FolderOpen}
                />
                <StatsCard
                    title="Stok Rendah"
                    value={lowStockProducts?.length || 0}
                    icon={AlertTriangle}
                    variant={lowStockProducts && lowStockProducts.length > 0 ? "warning" : "default"}
                    description="Produk dengan stok < 5"
                />
                <StatsCard
                    title="Status"
                    value="Aktif"
                    icon={TrendingUp}
                    variant="success"
                />
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts && lowStockProducts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5" />
                        Peringatan Stok Rendah
                    </h2>
                    <div className="space-y-2">
                        {lowStockProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-lg px-4 py-3"
                            >
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {product.name}
                                </span>
                                <span className="text-red-600 font-bold">
                                    Sisa: {product.stock}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/admin/products"
                        className="inline-block mt-4 text-sm text-red-700 dark:text-red-300 hover:underline"
                    >
                        Kelola Stok →
                    </Link>
                </div>
            )}

            {/* Recent Products */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Produk Terbaru
                    </h2>
                    <Link
                        href="/admin/products"
                        className="text-sm text-orange-600 hover:underline"
                    >
                        Lihat Semua
                    </Link>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {recentProducts?.map((product) => (
                        <div
                            key={product.id}
                            className="px-6 py-4 flex items-center justify-between"
                        >
                            <div>
                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {product.name}
                                </p>
                                <p className="text-sm text-zinc-500">
                                    {(product.category as { name: string } | null)?.name || "Tanpa Kategori"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-orange-600">
                                    Rp {product.price.toLocaleString("id-ID")}
                                </p>
                                <p className={`text-sm ${product.stock < 5 ? "text-red-600" : "text-zinc-500"}`}>
                                    Stok: {product.stock}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
