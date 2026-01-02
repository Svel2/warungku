import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatRupiah, cn } from "@/lib/utils";
import { Package, User, Calendar, ArrowRight } from "lucide-react";
import Navbar from "@/components/catalog/Navbar";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Orders
    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Fetch Profile Role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return (
        <div className="min-h-screen bg-[var(--color-cream)]">
            <Navbar />
            <div className="pt-24 pb-12">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h1 className="font-display text-3xl text-[var(--color-charcoal)] mb-8">Akun Saya</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-cream-dark)]">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-[var(--color-forest)]/10 rounded-full flex items-center justify-center text-[var(--color-forest)]">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-[var(--color-charcoal)]">{user.email}</h2>
                                        <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{profile?.role || 'Customer'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-[var(--color-charcoal)]/80 p-2 hover:bg-zinc-50 rounded-md transition-colors cursor-pointer">
                                        <Package className="w-4 h-4" />
                                        <span>Pesanan Saya</span>
                                    </div>
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Orders */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="font-display text-xl text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" /> Riwayat Pesanan
                            </h2>

                            {orders && orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-[var(--color-cream-dark)] hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-dashed border-zinc-200">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn(
                                                            "px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full",
                                                            order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                                                                order.status === 'completed' ? "bg-green-100 text-green-700" :
                                                                    "bg-zinc-100 text-zinc-700"
                                                        )}>
                                                            {order.status}
                                                        </span>
                                                        <span className="text-sm text-[var(--color-muted)]">
                                                            #{order.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--color-muted)] flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-display text-lg text-[var(--color-forest)]">
                                                        {formatRupiah(order.total_amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1 text-sm text-[var(--color-charcoal)]/80">
                                                    <p><span className="text-[var(--color-muted)]">Penerima:</span> {order.customer_name}</p>
                                                    <p><span className="text-[var(--color-muted)]">Alamat:</span> <span className="line-clamp-1 inline-block align-bottom">{order.customer_address}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white p-12 rounded-lg border border-dashed border-zinc-300 text-center">
                                    <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-[var(--color-charcoal)] mb-2">Belum ada pesanan</h3>
                                    <p className="text-[var(--color-muted)] mb-6">Yuk mulai belanja produk kebutuhanmu!</p>
                                    <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-forest)] font-medium hover:underline">
                                        Mulai Belanja <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
