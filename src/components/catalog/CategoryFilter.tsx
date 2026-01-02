"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Category } from "@/types/database";

interface CategoryFilterProps {
    categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category");

    const handleSelect = (categoryName: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (categoryName) {
            params.set("category", categoryName);
        } else {
            params.delete("category");
        }

        router.push(`/?${params.toString()}`, { scroll: false });
    };

    return (
        <section id="categories" className="bg-[var(--color-warm-white)] py-8 border-y border-[var(--color-cream-dark)]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                    <button
                        onClick={() => handleSelect(null)}
                        className={cn(
                            "whitespace-nowrap px-5 py-2 rounded-full text-sm transition-all border",
                            !activeCategory
                                ? "bg-[var(--color-forest)] text-white border-[var(--color-forest)]"
                                : "bg-transparent text-[var(--color-charcoal)] border-[var(--color-charcoal)]/20 hover:border-[var(--color-forest)] hover:text-[var(--color-forest)]"
                        )}
                    >
                        Semua Produk
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleSelect(category.name)}
                            className={cn(
                                "whitespace-nowrap px-5 py-2 rounded-full text-sm transition-all border flex items-center gap-2",
                                activeCategory === category.name
                                    ? "bg-[var(--color-forest)] text-white border-[var(--color-forest)]"
                                    : "bg-transparent text-[var(--color-charcoal)] border-[var(--color-charcoal)]/20 hover:border-[var(--color-forest)] hover:text-[var(--color-forest)]"
                            )}
                        >
                            <span>{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
