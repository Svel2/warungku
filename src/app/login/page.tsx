"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        // Check user role for redirect logic
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "admin") {
                router.push("/admin");
            } else {
                // Check for 'next' parameter to redirect back to intended page
                const nextParam = new URLSearchParams(window.location.search).get("next");
                router.push(nextParam || "/");
            }

            toast.success("Login berhasil!");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-forest)]/10 flex items-center justify-center mb-4">
                        <Store className="w-8 h-8 text-[var(--color-forest)]" />
                    </div>
                    <h1 className="font-display text-2xl text-[var(--color-charcoal)]">
                        Masuk ke WarungKu
                    </h1>
                    <p className="text-[var(--color-muted)] mt-1">
                        Selamat datang kembali!
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl border border-[var(--color-cream-dark)] shadow-sm p-6 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="nama@email.com"
                                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-[var(--color-forest)] text-white font-medium rounded-lg hover:bg-[var(--color-forest-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Masuk...
                            </>
                        ) : (
                            "Masuk"
                        )}
                    </button>

                    <p className="text-center text-sm text-[var(--color-muted)] pt-2">
                        Belum punya akun?{" "}
                        <a href="/register" className="text-[var(--color-forest)] hover:underline font-medium">
                            Daftar disini
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
