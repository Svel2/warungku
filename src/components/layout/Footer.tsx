import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[var(--color-charcoal)] text-white pt-16 pb-8">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="font-display text-2xl tracking-wide">WarungKu</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                            Mendefinisikan ulang pengalaman belanja kebutuhan sehari-hari dengan sentuhan modern dan kualitas premium.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-medium mb-6">Menu</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Beranda</Link></li>
                            <li><Link href="/profile" className="hover:text-[var(--color-gold)] transition-colors">Akun Saya</Link></li>
                            <li><Link href="/cart" className="hover:text-[var(--color-gold)] transition-colors">Keranjang</Link></li>
                            <li><Link href="/register" className="hover:text-[var(--color-gold)] transition-colors">Daftar Member</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-medium mb-6">Hubungi Kami</h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-1 text-[var(--color-forest)]" />
                                <span>Jl. Raya Premium No. 123<br />Jakarta Selatan, 12345</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[var(--color-forest)]" />
                                <span>+62 812 3456 7890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[var(--color-forest)]" />
                                <span>hello@warungku.premium</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-medium mb-6">Ikuti Kami</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[var(--color-forest)] transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[var(--color-forest)] transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-[var(--color-forest)] transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
                    <p>© 2026 WarungKu Premium. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
