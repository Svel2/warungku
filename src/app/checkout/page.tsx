"use client";

import { useCartStore } from "@/stores/useCartStore";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/orders";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const totalPrice = getTotalPrice();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-cream)]">
                <h1 className="text-2xl font-display mb-4">Keranjang Kosong</h1>
                <Link href="/" className="text-[var(--color-forest)] underline">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            customer_name: formData.get("customer_name") as string,
            customer_phone: formData.get("customer_phone") as string,
            customer_address: formData.get("customer_address") as string,
            items: items.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            })),
            total_amount: totalPrice
        };

        try {
            const result = await createOrder(data);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Pesanan berhasil dibuat!");
                clearCart();
                router.push("/?order_success=true"); // Simple success handling
            }
        } catch (error) {
            toast.error("Gagal membuat pesanan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Form Section */}
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-forest)] mb-8">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </Link>

                    <h2 className="font-display text-2xl text-[var(--color-charcoal)] mb-6">Informasi Pengiriman</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                            <input
                                name="customer_name"
                                required
                                className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">No WhatsApp</label>
                            <input
                                name="customer_phone"
                                required
                                type="tel"
                                className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                            <textarea
                                name="customer_address"
                                required
                                rows={3}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[var(--color-forest)] text-white font-medium rounded-sm hover:bg-[var(--color-forest-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-sm shadow-sm h-fit">
                    <h3 className="font-display text-xl text-[var(--color-charcoal)] mb-6">Ringkasan Pesanan</h3>

                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                        {items.map((item) => (
                            <div key={item.product.id} className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.product.name}</p>
                                    <p className="text-xs text-[var(--color-muted)]">{item.quantity} x {formatRupiah(item.product.price)}</p>
                                </div>
                                <p className="text-sm font-medium">{formatRupiah(item.product.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--color-muted)]">Subtotal</span>
                            <span className="text-sm font-medium">{formatRupiah(totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[var(--color-muted)]">Biaya Layanan</span>
                            <span className="text-sm font-medium">Gratis</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-display text-lg">Total</span>
                            <span className="font-display text-lg text-[var(--color-forest)]">{formatRupiah(totalPrice)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
