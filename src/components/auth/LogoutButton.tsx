"use client";

import { useState } from "react";
import { LogOut, AlertTriangle, X } from "lucide-react";

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);

        // Submit form programmatically
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/auth/signout";
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center gap-3 text-sm text-red-600 p-2 hover:bg-red-50 rounded-md transition-colors text-left"
            >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
            </button>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !isLoading && setShowConfirm(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
                        {/* Close button */}
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isLoading}
                            className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-center text-[var(--color-charcoal)] mb-2">
                            Yakin ingin keluar?
                        </h3>
                        <p className="text-sm text-center text-[var(--color-muted)] mb-6">
                            Anda akan keluar dari akun dan perlu login kembali untuk mengakses fitur akun.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 text-sm font-medium text-[var(--color-charcoal)] bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Keluar...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-4 h-4" />
                                        <span>Ya, Keluar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
