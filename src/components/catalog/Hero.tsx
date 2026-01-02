export default function Hero() {
    return (
        <section className="relative pt-32 pb-16 px-6 lg:px-12 bg-[var(--color-cream)] bg-noise">
            <div className="container mx-auto max-w-4xl">
                {/* Elegant Header */}
                <div className="text-center space-y-6">
                    <p className="text-[var(--color-forest)] text-sm tracking-[0.3em] uppercase font-medium">
                        Toko Kelontong Premium
                    </p>

                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[var(--color-charcoal)] leading-tight">
                        Belanja dengan <br className="hidden sm:block" />
                        <span className="italic text-[var(--color-forest)]">Pengalaman Berbeda</span>
                    </h1>

                    <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto leading-relaxed">
                        Kebutuhan sehari-hari dengan kualitas pilihan terbaik,
                        tersedia untuk Anda kapan saja.
                    </p>

                    {/* Subtle Divider */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <span className="w-12 h-px bg-[var(--color-forest)]/30" />
                        <span className="text-[var(--color-forest)] text-lg">✦</span>
                        <span className="w-12 h-px bg-[var(--color-forest)]/30" />
                    </div>
                </div>
            </div>
        </section>
    );
}
