"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore, CartItem } from "@/stores/useCartStore";
import { formatRupiah, cn } from "@/lib/utils";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
    const totalPrice = getTotalPrice();

    return (
        <>
            {/* Backdrop - z-50 */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer - z-[60] to be above backdrop */}
            <div
                className={cn(
                    "fixed right-0 top-0 h-full w-[85vw] max-w-md bg-[var(--color-cream)] shadow-2xl z-[60] transition-transform duration-300 flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header with prominent close button */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--color-cream-dark)]">
                    {/* Close button - always visible, left side on mobile */}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 p-2 -ml-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors text-[var(--color-charcoal)]"
                    >
                        <ChevronRight className="w-5 h-5" />
                        <span className="text-sm sm:hidden">Tutup</span>
                    </button>

                    <h2 className="font-display text-lg sm:text-xl text-[var(--color-charcoal)] flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                        <span className="hidden sm:inline">Keranjang</span>
                    </h2>

                    {/* Desktop close button */}
                    <button
                        onClick={onClose}
                        className="hidden sm:flex p-2 rounded-full hover:bg-[var(--color-cream-dark)] transition-colors"
                    >
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>

                    {/* Spacer for mobile to balance header */}
                    <div className="w-10 sm:hidden" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <span className="text-4xl mb-4 opacity-30">✦</span>
                            <h3 className="font-display text-lg text-[var(--color-charcoal)] mb-1">
                                Keranjang Kosong
                            </h3>
                            <p className="text-sm text-[var(--color-muted)]">
                                Tambahkan produk untuk memulai belanja
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 px-6 py-2 border border-[var(--color-forest)] text-[var(--color-forest)] rounded-sm text-sm hover:bg-[var(--color-forest)] hover:text-white transition-colors"
                            >
                                Lanjut Belanja
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            {items.map((item) => (
                                <CartItemCard
                                    key={item.product.id}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeItem}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-[var(--color-cream-dark)] p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[var(--color-muted)]">Total</span>
                            <span className="font-display text-xl sm:text-2xl text-[var(--color-forest)]">
                                {formatRupiah(totalPrice)}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={clearCart}
                                className="flex-1 py-3 px-4 border border-[var(--color-charcoal)]/20 text-[var(--color-charcoal)] rounded-sm text-sm hover:bg-[var(--color-cream-dark)] transition-colors"
                            >
                                Kosongkan
                            </button>
                            <Link
                                href="/checkout"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-[var(--color-forest)] text-white rounded-sm text-sm font-medium hover:bg-[var(--color-forest-dark)] transition-colors text-center"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function CartItemCard({
    item,
    onUpdateQuantity,
    onRemove,
}: {
    item: CartItem;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-20 h-24 bg-[var(--color-cream-dark)] flex-shrink-0 overflow-hidden rounded-sm">
                {item.product.image_url ? (
                    <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xl opacity-30">✦</span>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[var(--color-charcoal)] text-sm line-clamp-2">
                    {item.product.name}
                </h4>
                <p className="font-display text-[var(--color-forest)] mt-1">
                    {formatRupiah(item.product.price)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 border border-[var(--color-charcoal)]/20 flex items-center justify-center hover:bg-[var(--color-cream-dark)] transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 border border-[var(--color-charcoal)]/20 flex items-center justify-center hover:bg-[var(--color-cream-dark)] transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Remove */}
            <button
                onClick={() => onRemove(item.product.id)}
                className="p-2 text-[var(--color-muted)] hover:text-red-600 transition-colors self-start"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
