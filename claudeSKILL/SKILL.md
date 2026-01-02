---
name: warungku-auth
description: Specialized guide for implementing authentication & authorization in Next.js 15 e-commerce applications with Supabase. Use this skill when working on WarungKu project or similar Next.js + Supabase e-commerce apps requiring authentication flows, protected cart actions, profile management, and secure checkout processes. Covers best practices for client/server component patterns, middleware configuration, protected routes, and state management with Zustand.
---

# WarungKu Authentication & E-Commerce Flow

Comprehensive guide for implementing secure authentication and authorization patterns in Next.js 15 e-commerce applications using Supabase.

## Core Architecture

**Stack:**
- Next.js 15 (App Router) with TypeScript
- Supabase Auth (with SSR)
- Zustand (state management)
- React Hook Form + Zod (validation)
- Tailwind CSS

**Key Principles:**
1. Public catalog access (no auth required)
2. Protected cart actions (auth required before adding items)
3. Seamless redirect flow with `next` parameter
4. Client/Server component separation
5. Middleware-based route protection

## Workflow Decision Tree

```
User Action
├─ Browse Products? → ✅ Allow (public access)
├─ Search/Filter? → ✅ Allow (public access)
├─ Add to Cart?
│  ├─ Is Authenticated? → ✅ Add to cart
│  └─ Not Authenticated? → Redirect to /login?next={currentPath}
├─ View Cart?
│  ├─ Is Authenticated? → ✅ Show cart
│  └─ Not Authenticated? → Show empty cart, prompt login
├─ Checkout?
│  ├─ Is Authenticated? → ✅ Proceed to checkout
│  └─ Not Authenticated? → Middleware redirects to login
└─ View Profile?
   ├─ Is Authenticated? → ✅ Show profile
   └─ Not Authenticated? → Middleware redirects to login
```

## Task-Based Implementation

### Task 1: Protect Add to Cart Action

**Goal:** Require authentication before allowing users to add items to cart

**Implementation Pattern:**

```typescript
// src/components/catalog/AddToCartButton.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { Product } from "@/types/database";
import { toast } from "sonner";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    // Step 1: Check authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Step 2: Redirect to login with return URL
      const currentPath = window.location.pathname;
      router.push(`/login?next=${encodeURIComponent(currentPath)}`);
      
      toast.info("Silakan login terlebih dahulu untuk menambahkan ke keranjang");
      return;
    }
    
    // Step 3: Proceed with cart action
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={product.stock <= 0}
      className="btn-primary"
    >
      Add to Cart
    </button>
  );
}
```

**Key Points:**
- Use client component for interactive auth check
- Always check auth before state mutation
- Preserve user's location with `next` parameter
- Provide clear feedback with toast notifications

### Task 2: Implement Login with Redirect

**Goal:** Allow users to login and return to intended page

```typescript
// src/app/login/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
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
      return;
    }

    // Success: redirect to intended page
    toast.success("Login berhasil!");
    router.push(next);
    router.refresh(); // Update server components
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Task 3: Create Profile Page

**Goal:** Display user information and order history

```typescript
// src/app/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Fetch user (middleware already verified auth)
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
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
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1>Profile: {profile?.full_name || user.email}</h1>
      {/* Display profile info and orders */}
    </div>
  );
}
```

### Task 4: Implement Checkout Protection

**Middleware already handles this, but add validation:**

```typescript
// src/app/checkout/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  // Additional validation: check if cart has items
  // This would come from your cart state or database

  return (
    <div>
      {/* Checkout form */}
    </div>
  );
}
```

### Task 5: Implement Logout

```typescript
// src/components/layout/Navbar.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";

export function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    const supabase = createClient();
    
    // Clear session
    await supabase.auth.signOut();
    
    // Clear cart from storage
    useCartStore.persist.clearStorage();
    
    // Redirect to home
    router.push("/");
    router.refresh();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Best Practices & Patterns

### 1. Client vs Server Component Strategy

**Use Server Components:**
```typescript
// ✅ Good: Server component for initial data fetch
export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*");
  
  return <ProductGrid products={products} />;
}
```

**Use Client Components:**
```typescript
// ✅ Good: Client component for interactive auth
"use client";

export function CartButton() {
  const { user } = useAuth(); // Client-side auth check
  const router = useRouter();
  
  const handleClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Show cart
  };
}
```

### 2. Middleware Configuration

**Your current middleware is good, but here's the pattern:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Always refresh session
  const { user } = await supabase.auth.getUser();
  
  // Protected routes pattern
  const protectedRoutes = ["/profile", "/checkout", "/orders"];
  const isProtected = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return supabaseResponse;
}
```

### 3. Security Checklist

- ✅ **Row Level Security (RLS)** enabled in Supabase
- ✅ **Middleware protection** for sensitive routes
- ✅ **Server-side validation** for all mutations
- ✅ **Client-side checks** for UX only, never security
- ✅ **Role-based access** for admin routes
- ✅ **Input sanitization** on all forms

### 4. State Management Pattern

```typescript
// Zustand store with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => { /* ... */ },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'warungku-cart',
      // Clear on logout
      onRehydrateStorage: () => async (state) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          state?.clearCart();
        }
      }
    }
  )
);
```

## Reference Files

This skill includes detailed references for advanced patterns:

### references/nextjs-supabase-patterns.md
Complete guide for Next.js 15 + Supabase SSR patterns including:
- Client vs Server component usage
- Cookie handling and session management
- Revalidation strategies
- Error handling patterns

**Read when:** Setting up Supabase clients, troubleshooting session issues

### references/protected-routes.md
Advanced route protection strategies:
- Middleware patterns for different route types
- Role-based access control (RBAC)
- Dynamic route protection
- Redirect strategies

**Read when:** Implementing complex route protection, adding admin features

### references/auth-flow-examples.md
Complete implementation examples:
- Registration with email verification
- Password reset flow
- OAuth integration (Google, GitHub)
- Multi-step authentication

**Read when:** Building login/register pages, implementing OAuth

## Troubleshooting

### Issue: Redirect Loop
**Symptom:** Page keeps redirecting between login and protected route

**Solution:**
```typescript
// Check middleware matcher - ensure login is NOT protected
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|register|auth).*)',
  ],
};
```

### Issue: Session Not Persisting
**Symptom:** User gets logged out on page refresh

**Solution:**
```typescript
// Verify cookie handling in middleware
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        // Important: Set on both request and response
        request.cookies.set(name, value);
        supabaseResponse.cookies.set(name, value, options);
      },
    },
  }
);
```

### Issue: Cart Persists After Logout
**Symptom:** Cart items still visible after logout

**Solution:**
```typescript
// Clear Zustand persist storage on logout
await supabase.auth.signOut();
useCartStore.persist.clearStorage();
localStorage.removeItem('warungku-cart');
```

### Issue: "User not found" After Login
**Symptom:** Login succeeds but user data not available

**Solution:**
```typescript
// Call router.refresh() after login
await supabase.auth.signInWithPassword(credentials);
router.push(next);
router.refresh(); // ← Important: Updates server components
```

## Quick Reference

### Common Auth Checks

```typescript
// Client-side check (for UX)
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

// Server-side check (for security)
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Role Verification

```typescript
// Check user role
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (profile?.role !== "admin") {
  redirect("/");
}
```

### Protected Action Template

```typescript
async function protectedAction() {
  // 1. Check auth
  const { user } = await supabase.auth.getUser();
  if (!user) {
    router.push("/login?next=" + currentPath);
    return;
  }
  
  // 2. Perform action
  // 3. Show feedback
}
```

## Resources

For implementation details, consult the reference files in this skill directory.