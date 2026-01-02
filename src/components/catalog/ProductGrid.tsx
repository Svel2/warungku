import { Product } from "@/types/database";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-4xl mb-4 opacity-30">✦</span>
                <h3 className="font-display text-xl text-[var(--color-charcoal)] mb-2">
                    Belum Ada Produk
                </h3>
                <p className="text-[var(--color-muted)] text-sm max-w-xs">
                    Produk untuk kategori ini sedang dalam persiapan.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {products.map((product, index) => (
                <div
                    key={product.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    );
}
