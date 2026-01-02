"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { Product, Category } from "@/types/database";
import { formatRupiah, cn } from "@/lib/utils";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import ImageUpload from "@/components/admin/ImageUpload";

interface ProductsClientProps {
    initialProducts: Product[];
    categories: Category[];
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
    const [products] = useState(initialProducts);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        try {
            let result;
            if (editingProduct) {
                result = await updateProduct(editingProduct.id, formData);
            } else {
                result = await createProduct(formData);
            }

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editingProduct ? "Produk berhasil diupdate!" : "Produk berhasil ditambah!");
                setShowForm(false);
                setEditingProduct(null);
            }
        } catch {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Hapus produk "${product.name}"?`)) return;

        const result = await deleteProduct(product.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Produk berhasil dihapus!");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Produk</h1>
                    <p className="text-sm text-zinc-500">Kelola semua produk warung</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setImageUrl(null);
                        setShowForm(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Produk</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Cari produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
                />
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-zinc-50 dark:bg-zinc-800">
                        <tr>
                            <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Produk</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Kategori</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Harga</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Stok</th>
                            <th className="text-left px-6 py-3 text-sm font-medium text-zinc-500">Status</th>
                            <th className="text-right px-6 py-3 text-sm font-medium text-zinc-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                    {(product.category as Category | null)?.name || "-"}
                                </td>
                                <td className="px-6 py-4 font-medium text-orange-600">
                                    {formatRupiah(product.price)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-bold",
                                        product.stock < 5
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    )}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        product.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-zinc-100 text-zinc-500"
                                    )}>
                                        {product.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setImageUrl(product.image_url);
                                            setShowForm(true);
                                        }}
                                        className="p-2 text-zinc-500 hover:text-orange-600 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product)}
                                        className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500">
                                        {(product.category as Category | null)?.name || "Tanpa Kategori"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setImageUrl(product.image_url);
                                        setShowForm(true);
                                    }}
                                    className="p-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product)}
                                    className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-bold",
                                    product.stock < 5
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                )}>
                                    Stok: {product.stock}
                                </span>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    product.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-zinc-100 text-zinc-500"
                                )}>
                                    {product.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                            </div>
                            <p className="font-bold text-orange-600">
                                {formatRupiah(product.price)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                    <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500">Tidak ada produk ditemukan</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">
                            {editingProduct ? "Edit Produk" : "Tambah Produk"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Foto Produk</label>
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                />
                                <input type="hidden" name="image_url" value={imageUrl || ""} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Produk</label>
                                <input
                                    name="name"
                                    defaultValue={editingProduct?.name}
                                    required
                                    className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Harga</label>
                                    <input
                                        name="price"
                                        type="number"
                                        defaultValue={editingProduct?.price}
                                        required
                                        className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stok</label>
                                    <input
                                        name="stock"
                                        type="number"
                                        defaultValue={editingProduct?.stock}
                                        required
                                        className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori</label>
                                <select
                                    name="category_id"
                                    defaultValue={editingProduct?.category_id || ""}
                                    className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingProduct?.description || ""}
                                    rows={2}
                                    className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                />
                            </div>

                            {editingProduct && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        value="true"
                                        defaultChecked={editingProduct.is_active}
                                        id="is_active"
                                        className="w-4 h-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium">
                                        Produk Aktif
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                                >
                                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
