"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchBar from "./SearchBar";

export default function Navbar() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const totalItems = useCartStore((state) => state.getTotalItems());

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();

                const { data: { user }, error: authError } = await supabase.auth.getUser();

                // "Auth session missing!" is not an error - it's a normal state when user is not logged in
                if (authError && authError.message !== "Auth session missing!") {
                    console.error("Auth error in Navbar:", authError.message);
                }

                if (authError || !user) {
                    setIsLoggedIn(false);
                    setIsLoading(false);
                    return;
                }

                if (user) {
                    setIsLoggedIn(true);

                    // Gunakan maybeSingle() untuk menghindari error jika profile belum ada
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileError) {
                        console.error("Profile fetch error:", profileError.message);
                    }

                    if (profile?.role === 'admin') {
                        setIsAdmin(true);
                    }
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Unexpected error in Navbar:", error);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserRole();
    }, []);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-cream)]/95 backdrop-blur-md safe-area-top">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
                        {/* Brand */}
                        <Link
                            href="/"
                            className="font-display text-xl sm:text-2xl tracking-tight text-[var(--color-forest)] hover:text-[var(--color-forest-dark)] transition-colors flex-shrink-0"
                        >
                            WarungKu
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:block flex-1 max-w-sm mx-auto">
                            <SearchBar />
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8 text-sm flex-shrink-0">
                            <Link
                                href="/"
                                className="text-[var(--color-charcoal)] hover:text-[var(--color-forest)] transition-colors relative group"
                            >
                                Katalog
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--color-forest)] transition-all group-hover:w-full" />
                            </Link>

                            {/* Admin Link - Only visible if isAdmin is true */}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="text-[var(--color-muted)] hover:text-[var(--color-forest)] transition-colors relative group"
                                >
                                    Admin
                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--color-forest)] transition-all group-hover:w-full" />
                                </Link>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
                            {!isLoading && (
                                isLoggedIn ? (
                                    <Link
                                        href="/profile"
                                        className="p-2 text-[var(--color-charcoal)] hover:text-[var(--color-forest)] transition-colors touch-manipulation"
                                        title="Profil Saya"
                                    >
                                        <User className="w-5 h-5" strokeWidth={1.5} />
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-dark)] rounded-lg transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                )
                            )}

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-[var(--color-charcoal)] hover:text-[var(--color-forest)] transition-colors touch-manipulation"
                            >
                                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 rounded-full bg-[var(--color-forest)] text-white text-xs font-medium flex items-center justify-center px-1.5">
                                        {totalItems}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-[var(--color-charcoal)] touch-manipulation"
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search - Visible only on mobile */}
                    <div className="md:hidden pb-3">
                        <SearchBar />
                    </div>

                    {/* Subtle border */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-forest)]/10 to-transparent" />
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[var(--color-cream)] border-t border-[var(--color-cream-dark)] py-4 px-4 animate-fade-in">
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/"
                                className="text-[var(--color-charcoal)] font-medium py-3 px-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Katalog
                            </Link>
                            <Link
                                href="#categories"
                                className="text-[var(--color-muted)] py-3 px-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Kategori
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="text-[var(--color-muted)] py-3 px-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Admin Panel
                                </Link>
                            )}
                            <div className="h-px bg-[var(--color-cream-dark)] my-2" />
                            {!isLoading && (
                                isLoggedIn ? (
                                    <Link
                                        href="/profile"
                                        className="text-[var(--color-muted)] py-3 px-2 rounded-lg hover:bg-[var(--color-cream-dark)] transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profil Saya
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-white bg-[var(--color-forest)] py-3 px-4 rounded-lg text-center font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="text-[var(--color-forest)] py-3 px-2 text-center font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Daftar Akun Baru
                                        </Link>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
