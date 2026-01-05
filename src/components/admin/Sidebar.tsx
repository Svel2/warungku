"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderOpen, LogOut, Store, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produk", icon: Package },
    { href: "/admin/categories", label: "Kategori", icon: FolderOpen },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-zinc-900 text-white p-2 rounded-lg shadow-lg hover:bg-zinc-800 transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-full w-64 bg-zinc-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out",
                    // On mobile: hidden by default, slide in when menu is open
                    "md:translate-x-0",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-800">
                    <Link href="/admin" className="flex items-center gap-3" onClick={closeMobileMenu}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">WarungKu</h1>
                            <p className="text-xs text-zinc-400">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-orange-600 text-white"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800">
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Kembali ke Toko
                    </Link>
                </div>
            </aside>
        </>
    );
}
