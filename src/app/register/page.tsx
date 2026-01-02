"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Registrasi berhasil! Cek email untuk verifikasi.");
            router.push("/login?message=Check your email for verification link");
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-[var(--color-cream-dark)]">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-forest)] mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
                    </Link>
                    <h1 className="font-display text-2xl text-[var(--color-charcoal)]">Daftar Akun Baru</h1>
                    <p className="text-[var(--color-muted)] text-sm">Buat akun untuk mulai belanja</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                            placeholder="nama@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                            placeholder="Minimal 6 karakter"
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 bg-[var(--color-forest)] text-white font-medium rounded-sm hover:bg-[var(--color-forest-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Daftar Sekarang"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-[var(--color-forest)] hover:underline font-medium">
                        Masuk disini
                    </Link>
                </div>
            </div>
        </div>
    );
}
