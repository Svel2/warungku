import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatRupiah, cn } from "@/lib/utils";
import AddToCartButton from "@/components/catalog/AddToCartButton";
import { ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/catalog/Navbar";
import Footer from "@/components/layout/Footer";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("id", id)
        .single();

    if (!product) {
        notFound();
    }

    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock <= 0;

    return (
        <div className="min-h-screen bg-[var(--color-cream)]">
            <Navbar />
            <div className="pt-24 pb-12">
                <div className="container mx-auto px-6 lg:px-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-forest)] transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Kembali ke Katalog
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        {/* Image Section */}
                        <div className="relative aspect-square w-full bg-[var(--color-cream-dark)] rounded-lg overflow-hidden shadow-lg">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <span className="text-6xl opacity-30">✦</span>
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                {isOutOfStock ? (
                                    <span className="px-3 py-1 bg-zinc-900 text-white text-xs tracking-wider uppercase font-medium rounded-full">Habis</span>
                                ) : isLowStock ? (
                                    <span className="px-3 py-1 bg-orange-600 text-white text-xs tracking-wider uppercase font-medium rounded-full">Stok Menipis</span>
                                ) : (
                                    <span className="px-3 py-1 bg-[var(--color-forest)] text-white text-xs tracking-wider uppercase font-medium rounded-full">Tersedia</span>
                                )}
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-8">
                            <div>
                                {product.category && (
                                    <Link
                                        href={`/?category=${(product.category as any).name}`}
                                        className="inline-block px-3 py-1 border border-[var(--color-forest)]/30 rounded-full text-xs uppercase tracking-widest text-[var(--color-forest)] hover:bg-[var(--color-forest)] hover:text-white transition-all mb-4"
                                    >
                                        {(product.category as any).name}
                                    </Link>
                                )}
                                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-[var(--color-charcoal)] mb-4 leading-tight">
                                    {product.name}
                                </h1>
                                <p className="font-display text-2xl text-[var(--color-forest)]">
                                    {formatRupiah(product.price)}
                                </p>
                            </div>

                            <div className="prose prose-zinc prose-sm max-w-none text-[var(--color-charcoal)]/80 leading-relaxed">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-[var(--color-charcoal)]">Deskripsi Produk</h3>
                                {product.description ? (
                                    <p>{product.description}</p>
                                ) : (
                                    <p className="italic text-[var(--color-muted)]">Belum ada deskripsi untuk produk ini.</p>
                                )}
                            </div>

                            <div className="pt-8 border-t border-[var(--color-cream-dark)]">
                                {isOutOfStock ? (
                                    <div className="p-4 bg-zinc-100 rounded-lg text-center">
                                        <p className="text-zinc-500 font-medium">Stok sedang kosong. Cek kembali nanti.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-[var(--color-forest)]">
                                            <Check className="w-4 h-4" />
                                            <span>Stok tersedia: {product.stock} unit</span>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <AddToCartButton product={product} />
                                            </div>
                                        </div>
                                        <p className="text-xs text-[var(--color-muted)] text-center">
                                            Garansi kualitas produk terjamin • Pengiriman cepat
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
