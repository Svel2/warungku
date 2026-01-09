# Complete Auth Flow Examples

Real-world implementation examples for authentication flows in Next.js + Supabase e-commerce applications.

## Example 1: Complete Login Page

Full implementation with error handling, validation, and redirect logic.

```typescript
// app/login/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Store, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Check user role for redirect
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        toast.success("Login berhasil!");
        
        // Redirect based on role or 'next' param
        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(next);
        }
        
        router.refresh(); // Update server components
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // User-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email atau password salah");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Silakan konfirmasi email Anda terlebih dahulu");
      } else {
        toast.error(error.message || "Login gagal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
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
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
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

          {/* Links */}
          <div className="space-y-2 pt-2">
            <p className="text-center text-sm text-[var(--color-muted)]">
              Belum punya akun?{" "}
              <Link 
                href="/register" 
                className="text-[var(--color-forest)] hover:underline font-medium"
              >
                Daftar disini
              </Link>
            </p>
            <p className="text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-[var(--color-muted)] hover:text-[var(--color-forest)] transition-colors"
              >
                Lupa password?
              </Link>
            </p>
          </div>
        </form>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-forest)] transition-colors"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## Example 2: Complete Registration Page

```typescript
// app/register/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Store, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Register user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) throw error;

      // Success
      toast.success("Registrasi berhasil!");
      toast.info("Cek email untuk verifikasi akun Anda");
      
      router.push("/login?message=Check your email for verification");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.message.includes("User already registered")) {
        toast.error("Email sudah terdaftar");
      } else {
        toast.error(error.message || "Registrasi gagal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-xl border border-[var(--color-cream-dark)]">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-forest)] mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
            </Link>
            <h1 className="font-display text-2xl text-[var(--color-charcoal)]">
              Daftar Akun Baru
            </h1>
            <p className="text-[var(--color-muted)] text-sm">
              Buat akun untuk mulai belanja
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal)] mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Ulangi password"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-sm focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-[var(--color-forest)] text-white font-medium rounded-sm hover:bg-[var(--color-forest-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftar...
                </>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[var(--color-forest)] hover:underline font-medium">
              Masuk disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Example 3: Protected Add to Cart

Complete implementation with auth check and redirect.

```typescript
// components/catalog/AddToCartButton.tsx
"use client";

import { Plus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Product } from "@/types/database";
import { useCartStore } from "@/stores/useCartStore";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = async () => {
    // Prevent multiple clicks
    if (isChecking || isAdded) return;
    
    setIsChecking(true);

    try {
      // Check authentication
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Save current location for redirect after login
        const currentPath = window.location.pathname;
        
        // Show info toast
        toast.info("Silakan login terlebih dahulu", {
          description: "Anda perlu login untuk menambahkan item ke keranjang",
        });

        // Redirect to login with return URL
        router.push(`/login?next=${encodeURIComponent(currentPath)}`);
        return;
      }

      // User is authenticated - proceed with cart action
      addItem(product);
      setIsAdded(true);

      toast.success(`${product.name} ditambahkan`, {
        description: "Lihat keranjang untuk checkout",
        duration: 2000,
      });

      // Reset button state after animation
      setTimeout(() => setIsAdded(false), 1500);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={product.stock <= 0 || isChecking}
      className={cn(
        "h-9 w-9 flex items-center justify-center rounded-full transition-all duration-300",
        isAdded
          ? "bg-[var(--color-forest)] text-white scale-110"
          : "bg-transparent border border-[var(--color-charcoal)]/20 text-[var(--color-charcoal)] hover:bg-[var(--color-forest)] hover:text-white hover:border-transparent",
        (product.stock <= 0 || isChecking) && "opacity-30 cursor-not-allowed"
      )}
      aria-label={isAdded ? "Added to cart" : "Add to cart"}
    >
      {isChecking ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isAdded ? (
        <Check className="w-4 h-4" strokeWidth={2} />
      ) : (
        <Plus className="w-4 h-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
```

## Example 4: Profile Page with Order History

```typescript
// app/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Package, MapPin, Mail } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch order history
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-cream-dark)] p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl text-[var(--color-charcoal)] mb-2">
                Profil Saya
              </h1>
              <p className="text-[var(--color-muted)]">
                Kelola informasi dan pesanan Anda
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-cream-dark)] p-6 mb-6">
          <h2 className="font-medium text-lg mb-4">Informasi Akun</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[var(--color-muted)]" />
              <div>
                <p className="text-sm text-[var(--color-muted)]">Nama</p>
                <p className="font-medium">
                  {profile?.full_name || "Belum diatur"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--color-muted)]" />
              <div>
                <p className="text-sm text-[var(--color-muted)]">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-cream-dark)] p-6">
          <h2 className="font-medium text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Riwayat Pesanan
          </h2>

          {!orders || orders.length === 0 ? (
            <p className="text-[var(--color-muted)] text-center py-8">
              Belum ada pesanan
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-zinc-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[var(--color-forest)]/10 text-[var(--color-forest)] rounded-full text-sm">
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product?.name} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-200 flex justify-between font-medium">
                    <span>Total</span>
                    <span>Rp {order.total_amount?.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Example 5: Logout Component

```typescript
// components/auth/LogoutButton.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Clear cart from local storage
      useCartStore.persist.clearStorage();
      localStorage.removeItem("warungku-cart");

      // Show success message
      toast.success("Logout berhasil");

      // Redirect to home
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout gagal");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
```

## Key Patterns Summary

1. **Always validate on both client and server**
2. **Use try-catch for error handling**
3. **Provide user-friendly error messages**
4. **Save redirect path in login flow**
5. **Clear sensitive data on logout**
6. **Use loading states for better UX**
7. **Disable buttons during loading**
8. **Show toast notifications for feedback**
9. **Handle edge cases (email verification, etc.)**
10. **Call router.refresh() after auth changes**n u