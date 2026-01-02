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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Kategori</h1>
                    <p className="text-zinc-500">Kelola kategori produk</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Kategori
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-start justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
                                {category.icon || <FolderOpen className="w-6 h-6 text-orange-600" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{category.name}</h3>
                                <p className="text-sm text-zinc-500">
                                    {productCounts[category.id] || 0} produk
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => {
                                    setEditingCategory(category);
                                    setShowForm(true);
                                }}
                                className="p-2 text-zinc-500 hover:text-orange-600 transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(category)}
                                className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Kategori</label>
                                <input
                                    name="name"
                                    defaultValue={editingCategory?.name}
                                    required
                                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
                                <input
                                    name="icon"
                                    defaultValue={editingCategory?.icon || ""}
                                    placeholder="🍜"
                                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingCategory?.description || ""}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
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
