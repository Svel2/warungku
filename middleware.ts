import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Helper function untuk mendapatkan role user dengan error handling
async function getUserRole(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<string | null> {
    try {
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .maybeSingle(); // Gunakan maybeSingle() bukan single() untuk menghindari error jika tidak ada

        if (error) {
            console.error("Error fetching profile:", error.message);
            return null;
        }

        return profile?.role || null;
    } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        return null;
    }
}

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
                    try {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    } catch (error) {
                        // Cookie setting bisa gagal di Server Components
                        // Ini aman diabaikan karena middleware akan refresh session
                        console.warn("Cookie set warning:", error);
                    }
                },
            },
        }
    );

    // Refresh session if exists
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    // Handle auth error gracefully
    if (authError) {
        console.error("Auth error in middleware:", authError.message);
    }

    const pathname = request.nextUrl.pathname;

    // Protect /admin routes
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }

        // Check role dengan error handling
        const role = await getUserRole(supabase, user.id);

        if (role !== "admin") {
            // Redirect non-admin atau user tanpa profile ke home
            const url = request.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }
    }

    // Protect Customer Routes (Profile & Checkout)
    const protectedRoutes = ["/profile", "/checkout"];
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            url.searchParams.set("next", pathname);
            return NextResponse.redirect(url);
        }
    }

    // Redirect logged-in users away from login page
    if (pathname === "/login") {
        if (user) {
            const url = request.nextUrl.clone();

            // Check role dengan error handling
            const role = await getUserRole(supabase, user.id);

            if (role === "admin") {
                url.pathname = "/admin";
            } else {
                url.pathname = "/";
            }

            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
