"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { Category } from "@/types/database";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";

interface CategoriesClientProps {
    initialCategories: Category[];
    productCounts: Record<string, number>;
}

export default function CategoriesClient({ initialCategories, productCounts }: CategoriesClientProps) {
    const [categories] = useState(initialCategories);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        try {
            let result;
            if (editingCategory) {
                result = await updateCategory(editingCategory.id, formData);
            } else {
                result = await createCategory(formData);
            }

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editingCategory ? "Kategori berhasil diupdate!" : "Kategori berhasil ditambah!");
                setShowForm(false);
                setEditingCategory(null);
            }
        } catch {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (category: Category) => {
        const count = productCounts[category.id] || 0;
        if (count > 0) {
            toast.error(`Tidak bisa hapus. Masih ada ${count} produk di kategori ini.`);
            return;
        }

        if (!confirm(`Hapus kategori "${category.name}"?`)) return;

        const result = await deleteCategory(category.id);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Kategori berhasil dihapus!");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Kategori</h1>
                    <p className="text-sm text-zinc-500">Kelola kategori produk</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setShowForm(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            {/* Grid - Responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 flex items-start justify-between"
                    >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                                {category.icon || <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{category.name}</h3>
                                <p className="text-xs sm:text-sm text-zinc-500">
                                    {productCounts[category.id] || 0} produk
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
                            <button
                                onClick={() => {
                                    setEditingCategory(category);
                                    setShowForm(true);
                                }}
                                className="p-1.5 sm:p-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(category)}
                                className="p-1.5 sm:p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {categories.length === 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                    <FolderOpen className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500">Belum ada kategori</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">
                            {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Kategori</label>
                                <input
                                    name="name"
                                    defaultValue={editingCategory?.name}
                                    required
                                    className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                                <input
                                    name="icon"
                                    defaultValue={editingCategory?.icon || ""}
                                    placeholder="🍜"
                                    className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingCategory?.description || ""}
                                    rows={2}
                                    className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm"
                                />
                            </div>
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
