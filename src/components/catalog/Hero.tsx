export default function Hero() {
    return (
        <section className="relative pt-24 sm:pt-32 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-12 bg-[var(--color-cream)] bg-noise">
            <div className="container mx-auto max-w-4xl">
                {/* Elegant Header */}
                <div className="text-center space-y-4 sm:space-y-6">
                    <p className="text-[var(--color-forest)] text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase font-medium">
                        Toko Kelontong Premium
                    </p>

                    <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--color-charcoal)] leading-tight">
                        Belanja dengan <br className="hidden sm:block" />
                        <span className="italic text-[var(--color-forest)]">Pengalaman Berbeda</span>
                    </h1>

                    <p className="text-[var(--color-muted)] text-base sm:text-lg max-w-xl mx-auto leading-relaxed px-2 sm:px-0">
                        Kebutuhan sehari-hari dengan kualitas pilihan terbaik,
                        tersedia untuk Anda kapan saja.
                    </p>

                    {/* Subtle Divider */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                        <span className="w-8 sm:w-12 h-px bg-[var(--color-forest)]/30" />
                        <span className="text-[var(--color-forest)] text-base sm:text-lg">✦</span>
                        <span className="w-8 sm:w-12 h-px bg-[var(--color-forest)]/30" />
                    </div>
                </div>
            </div>
        </section>
    );
}
