import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Sign out the user
    await supabase.auth.signOut();

    // Get the origin from the request URL for proper redirect
    const origin = request.nextUrl.origin;

    // Redirect to home page after sign out
    return NextResponse.redirect(new URL("/", origin));
}

// Handle GET request as well (in case someone navigates directly to this URL)
export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // Sign out the user
    await supabase.auth.signOut();

    // Get the origin from the request URL for proper redirect
    const origin = request.nextUrl.origin;

    // Redirect to home page after sign out
    return NextResponse.redirect(new URL("/", origin));
}
