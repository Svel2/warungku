"use client";

import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Product } from "@/types/database";
import { useCartStore } from "@/stores/useCartStore";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const [isAdded, setIsAdded] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const handleClick = () => {
        addItem(product);
        setIsAdded(true);

        toast.success(`${product.name} ditambahkan`, {
            description: "Lihat keranjang untuk checkout",
            duration: 2000,
        });

        setTimeout(() => setIsAdded(false), 1500);
    };

    return (
        <button
            onClick={handleClick}
            disabled={product.stock <= 0}
            className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300",
                isAdded
                    ? "bg-[var(--color-forest)] text-white scale-110"
                    : "bg-transparent border border-[var(--color-charcoal)]/20 text-[var(--color-charcoal)] hover:bg-[var(--color-forest)] hover:text-white hover:border-transparent",
                product.stock <= 0 && "opacity-30 cursor-not-allowed"
            )}
        >
            {isAdded ? (
                <Check className="w-4 h-4" strokeWidth={2} />
            ) : (
                <Plus className="w-4 h-4" strokeWidth={1.5} />
            )}
        </button>
    );
}
