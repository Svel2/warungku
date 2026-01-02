# Protected Routes & Authorization Patterns

Advanced route protection strategies for Next.js 15 + Supabase applications.

## Route Protection Levels

### Level 1: Public Routes
No authentication required. Anyone can access.

**Examples:** Home page, product listings, about page

```typescript
// app/page.tsx
export default async function HomePage() {
  // No auth check needed
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*");

  return <ProductGrid products={products} />;
}
```

### Level 2: Semi-Protected Actions
Page is public, but specific actions require auth.

**Examples:** Add to cart, add to wishlist, write review

```typescript
// components/AddToCartButton.tsx
"use client";

export function AddToCartButton({ product }) {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Save intended action
      sessionStorage.setItem("pendingCartItem", product.id);
      router.push(`/login?next=${window.location.pathname}&action=add-to-cart`);
      return;
    }
    
    // Proceed with protected action
    addToCart(product);
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}

// After login, complete pending action
// app/login/page.tsx
useEffect(() => {
  const pendingItem = sessionStorage.getItem("pendingCartItem");
  if (pendingItem && user) {
    addToCart(pendingItem);
    sessionStorage.removeItem("pendingCartItem");
  }
}, [user]);
```

### Level 3: Fully Protected Routes
Entire route requires authentication.

**Examples:** Profile, checkout, order history

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ["/profile", "/checkout", "/orders"];
  const isProtected = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

### Level 4: Role-Based Protected Routes
Routes protected by user role.

**Examples:** Admin panel, moderator tools

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
```

## Middleware Patterns

### Pattern 1: Simple Route Protection

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/profile") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Pattern 2: Multi-Level Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Level 1: Admin routes (role-based)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return redirectToLogin(request, pathname);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Level 2: Customer routes (auth-based)
  const customerRoutes = ["/profile", "/checkout", "/orders"];
  if (customerRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return redirectToLogin(request, pathname);
    }
  }

  // Level 3: Prevent logged-in users from accessing login
  if (pathname === "/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const destination = profile?.role === "admin" ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

function redirectToLogin(request: NextRequest, returnPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", returnPath);
  return NextResponse.redirect(url);
}
```

### Pattern 3: Dynamic Route Protection

For protecting dynamic routes like `/orders/[id]`:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { user } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Match pattern: /orders/:orderId
  const orderMatch = pathname.match(/^\/orders\/(.+)$/);
  
  if (orderMatch) {
    if (!user) {
      return redirectToLogin(request, pathname);
    }

    const orderId = orderMatch[1];

    // Verify order belongs to user
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (!order || order.user_id !== user.id) {
      return NextResponse.redirect(new URL("/orders", request.url));
    }
  }

  return supabaseResponse;
}
```

### Pattern 4: Redirect Strategies

**Strategy A: Preserve Full URL with Query Params**

```typescript
function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  const returnUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  
  url.pathname = "/login";
  url.searchParams.set("next", returnUrl);
  
  return NextResponse.redirect(url);
}

// After login:
const next = searchParams.get("next") || "/";
router.push(next); // Restores full URL including query params
```

**Strategy B: Role-Based Redirect After Login**

```typescript
// app/login/page.tsx
const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword(credentials);
  
  if (!error) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Redirect based on role or 'next' param
    const next = searchParams.get("next");
    
    if (next) {
      router.push(next);
    } else if (profile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
    
    router.refresh();
  }
};
```

## Row Level Security (RLS) Patterns

RLS is your REAL security layer. Middleware is just UX.

### Pattern 1: User-Owned Resources

```sql
-- profiles table
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
```

### Pattern 2: Role-Based Access

```sql
-- products table
CREATE POLICY "Anyone can view active products"
  ON products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### Pattern 3: Complex Authorization

```sql
-- orders table
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Client-Side Protection (UX Only)

**Remember: Client-side checks are for UX, NOT security.**

### Pattern 1: Conditional Rendering

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function AuthGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <LoginPrompt />;
  }

  return <>{children}</>;
}
```

### Pattern 2: Hook-Based Guards

```typescript
// hooks/useAuth.ts
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth(redirectTo = "/login") {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push(redirectTo);
      } else {
        setUser(user);
      }
      setLoading(false);
    });
  }, [redirectTo, router]);

  return { user, loading };
}

// Usage:
export function ProfilePage() {
  const { user, loading } = useAuth("/login?next=/profile");
  
  if (loading) return <LoadingSpinner />;
  
  return <ProfileDisplay user={user} />;
}
```

## Authorization Patterns

### Check Permissions Before Actions

```typescript
// Server Action
"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  
  // 1. Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // 2. Check authorization
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden" };
  }

  // 3. Perform action
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
```

### Verify Resource Ownership

```typescript
// Server Action
export async function updateOrder(orderId: string, updates: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify order belongs to user
  const { data: order } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) {
    return { error: "Forbidden" };
  }

  // Update order
  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId);

  return error ? { error: error.message } : { success: true };
}
```

## Security Checklist

- ✅ Middleware protects routes (UX layer)
- ✅ RLS policies protect data (REAL security)
- ✅ Server actions validate auth
- ✅ Server actions verify ownership
- ✅ Client checks are for UX only
- ✅ Never trust client-side auth for data access
- ✅ Always validate permissions on server
- ✅ Use proper redirect strategies
- ✅ Handle edge cases (expired sessions, etc.)
- ✅ Log security events