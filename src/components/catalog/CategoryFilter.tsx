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
        <section id="categories" className="bg-[var(--color-warm-white)] py-4 sm:py-6 border-y border-[var(--color-cream-dark)] sticky top-[64px] sm:top-20 z-30 backdrop-blur-sm bg-[var(--color-warm-white)]/95">
            <div className="container mx-auto px-0 sm:px-6 lg:px-12">
                {/* Scroll container with padding for edge visibility */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-4 sm:px-0 scroll-smooth">
                    <button
                        onClick={() => handleSelect(null)}
                        className={cn(
                            "whitespace-nowrap px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm transition-all border shrink-0 active:scale-95 touch-manipulation",
                            !activeCategory
                                ? "bg-[var(--color-forest)] text-white border-[var(--color-forest)] shadow-sm"
                                : "bg-white text-[var(--color-charcoal)] border-[var(--color-charcoal)]/20 hover:border-[var(--color-forest)] hover:text-[var(--color-forest)]"
                        )}
                    >
                        Semua Produk
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleSelect(category.name)}
                            className={cn(
                                "whitespace-nowrap px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm transition-all border flex items-center gap-1.5 sm:gap-2 shrink-0 active:scale-95 touch-manipulation",
                                activeCategory === category.name
                                    ? "bg-[var(--color-forest)] text-white border-[var(--color-forest)] shadow-sm"
                                    : "bg-white text-[var(--color-charcoal)] border-[var(--color-charcoal)]/20 hover:border-[var(--color-forest)] hover:text-[var(--color-forest)]"
                            )}
                        >
                            <span className="text-base">{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}

                    {/* Spacer for scroll padding on right */}
                    <div className="w-4 sm:w-0 shrink-0" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}
