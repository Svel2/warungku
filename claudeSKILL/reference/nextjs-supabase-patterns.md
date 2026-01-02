# Next.js 15 + Supabase SSR Patterns

Complete guide for implementing Supabase authentication in Next.js 15 App Router with Server-Side Rendering.

## Client vs Server Component Usage

### When to Use Server Components

Server Components are the default in Next.js 15 App Router. Use them for:

**1. Initial Data Fetching**
```typescript
// app/products/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true);

  return <ProductGrid products={products} />;
}
```

**2. SEO-Critical Pages**
```typescript
// app/products/[id]/page.tsx
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }): Promise<Metadata> {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  return {
    title: product?.name,
    description: product?.description,
  };
}
```

**3. Protected Pages with User Data**
```typescript
// app/profile/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return <ProfileDisplay profile={profile} />;
}
```

### When to Use Client Components

Client Components are needed for interactivity. Use them for:

**1. Interactive Auth Checks**
```typescript
// components/AddToCartButton.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AddToCartButton({ product }) {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login?next=" + window.location.pathname);
      return;
    }
    
    // Add to cart logic
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

**2. Forms with User Input**
```typescript
// app/login/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

**3. Real-time Updates**
```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function OrderStatus({ orderId }) {
  const [status, setStatus] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('order-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => setStatus(payload.new.status)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  return <div>Order Status: {status}</div>;
}
```

## Supabase Client Setup

### Server Client (for Server Components)

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

### Client Client (for Client Components)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Cookie Handling in Middleware

### Complete Middleware Pattern

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          
          // Create new response with updated cookies
          supabaseResponse = NextResponse.next({
            request,
          });
          
          // Set cookies on the response
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Your protection logic here...

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Revalidation Strategies

### Static Pages with Periodic Refresh

```typescript
// app/products/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*");

  return <ProductGrid products={products} />;
}
```

### Dynamic Pages with On-Demand Revalidation

```typescript
// app/actions/revalidate.ts
"use server";

import { revalidatePath } from "next/cache";

export async function revalidateProducts() {
  revalidatePath("/products");
}

// Usage in admin panel:
// await revalidateProducts();
```

### Cache Tags for Granular Control

```typescript
// app/products/[id]/page.tsx
export default async function ProductPage({ params }) {
  const supabase = await createClient();
  
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  return <ProductDetail product={product} />;
}

// Revalidate specific product
import { revalidateTag } from "next/cache";

export async function revalidateProduct(productId: string) {
  revalidateTag(`product-${productId}`);
}
```

## Error Handling Patterns

### Server Component Error Handling

```typescript
// app/products/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    console.error("Failed to fetch products:", error);
    return <ErrorDisplay message="Failed to load products" />;
  }

  if (!products || products.length === 0) {
    return <EmptyState message="No products found" />;
  }

  return <ProductGrid products={products} />;
}
```

### Client Component Error Handling

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Global Error Boundary

```typescript
// app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Session Management

### Refreshing Session

```typescript
// Always refresh session in middleware
const { data: { user } } = await supabase.auth.getUser();
```

### Checking Session Validity

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
}
```

## Performance Optimization

### Lazy Loading Components

```typescript
import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), {
  loading: () => <CartSkeleton />,
  ssr: false, // Disable SSR for client-only components
});
```

### Prefetching Data

```typescript
// Use router.prefetch for better UX
"use client";

import { useRouter } from "next/navigation";

export function ProductCard({ product }) {
  const router = useRouter();

  return (
    <div
      onMouseEnter={() => router.prefetch(`/products/${product.id}`)}
      onClick={() => router.push(`/products/${product.id}`)}
    >
      {product.name}
    </div>
  );
}
```

### Streaming with Suspense

```typescript
// app/products/page.tsx
import { Suspense } from "react";

async function ProductList() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*");
  return <ProductGrid products={products} />;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductList />
    </Suspense>
  );
}
```

## Common Patterns Checklist

- ✅ Use Server Components by default
- ✅ Add "use client" only when needed (forms, hooks, events)
- ✅ Create separate client files for server/client
- ✅ Always handle errors from Supabase calls
- ✅ Refresh session in middleware
- ✅ Use revalidation for cache control
- ✅ Implement loading states and skeletons
- ✅ Set proper cookie handling in middleware
- ✅ Never expose service_role key on client
- ✅ Use TypeScript for type safety