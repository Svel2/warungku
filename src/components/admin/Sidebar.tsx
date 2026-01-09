"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, FolderOpen, LogOut, Store, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produk", icon: Package },
    { href: "/admin/categories", label: "Kategori", icon: FolderOpen },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 text-white flex items-center justify-between px-4 z-50">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Store className="w-5 h-5" />
                    </div>
                    <span className="font-bold">WarungKu Admin</span>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar - Desktop always visible, Mobile slides in */}
            <aside className={cn(
                "fixed left-0 top-0 h-full w-64 bg-zinc-900 text-white flex flex-col z-50 transition-transform duration-300",
                // Desktop: always visible
                "lg:translate-x-0",
                // Mobile: slide in/out
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header - Hidden on mobile (using mobile header instead) */}
                <div className="hidden lg:block p-6 border-b border-zinc-800">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Store className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">WarungKu</h1>
                            <p className="text-xs text-zinc-400">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Mobile: Add top padding for mobile header */}
                <div className="lg:hidden h-16" />

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
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
                        onClick={() => setIsOpen(false)}
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
