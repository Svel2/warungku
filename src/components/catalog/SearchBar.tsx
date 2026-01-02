"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";

    const [text, setText] = useState(initialSearch);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        // Manual debounce with setTimeout
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (text) {
                params.set("search", text);
            } else {
                params.delete("search");
            }

            router.push(`/?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(timer);
    }, [text, router, searchParams]);

    return (
        <div className="relative w-full max-w-xs md:max-w-sm group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[var(--color-muted)] group-focus-within:text-[var(--color-forest)] transition-colors" />
            </div>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cari produk..."
                className={cn(
                    "w-full h-10 pl-10 pr-8 rounded-full bg-[var(--color-cream-dark)]/50 border border-transparent text-sm",
                    "placeholder:text-[var(--color-muted)]",
                    "focus:bg-white focus:border-[var(--color-forest)] focus:outline-none focus:ring-1 focus:ring-[var(--color-forest)]",
                    "transition-all duration-300"
                )}
            />
            {text && (
                <button
                    onClick={() => setText("")}
                    className="absolute inset-y-0 right-3 flex items-center text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
                >
                    <X className="h-4 h-4" />
                </button>
            )}
        </div>
    );
}
