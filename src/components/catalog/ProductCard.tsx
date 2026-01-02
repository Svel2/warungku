import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/database";
import { formatRupiah, cn } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock <= 0;

    return (
        <article className="group relative bg-white rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(45,90,74,0.15)]">
            <Link href={`/products/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full bg-[var(--color-cream-dark)] overflow-hidden">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-5xl opacity-40">✦</span>
                        </div>
                    )}

                    {/* Stock Badges */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <span className="font-display text-sm text-[var(--color-charcoal)] tracking-wide">
                                Habis
                            </span>
                        </div>
                    )}

                    {isLowStock && !isOutOfStock && (
                        <span className="absolute top-3 left-3 text-xs tracking-wider uppercase text-[var(--color-forest)] bg-white/90 px-2 py-1">
                            Sisa {product.stock}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Category */}
                    {product.category && (
                        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                            {(product.category as { name: string }).name}
                        </p>
                    )}

                    {/* Name */}
                    <h3 className="font-medium text-[var(--color-charcoal)] text-sm leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-[var(--color-forest)] transition-colors">
                        {product.name}
                    </h3>
                </div>
            </Link>

            <div className="px-4 pb-4">
                {/* Price & Action */}
                <div className="flex items-end justify-between pt-1">
                    <div>
                        <p className="font-display text-lg text-[var(--color-forest)]">
                            {formatRupiah(product.price)}
                        </p>
                    </div>

                    {!isOutOfStock && <AddToCartButton product={product} />}
                </div>
            </div>

            {/* Subtle bottom border on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-forest)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </article>
    );
}
