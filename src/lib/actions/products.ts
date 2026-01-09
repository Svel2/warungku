"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Helper function untuk cek admin authorization
async function requireAdmin() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: "Unauthorized: Silakan login terlebih dahulu", supabase: null };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "Forbidden: Anda tidak memiliki akses admin", supabase: null };
    }

    return { error: null, supabase };
}

// Validation helper
function validateProductInput(formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;

    if (!name || name.length < 2) {
        return { error: "Nama produk minimal 2 karakter" };
    }
    if (name.length > 200) {
        return { error: "Nama produk maksimal 200 karakter" };
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
        return { error: "Harga harus angka positif" };
    }
    if (price > 999999999) {
        return { error: "Harga terlalu besar" };
    }

    const stock = parseInt(stockStr);
    if (isNaN(stock) || stock < 0) {
        return { error: "Stok harus angka positif" };
    }
    if (stock > 999999) {
        return { error: "Stok terlalu besar" };
    }

    return {
        error: null,
        data: {
            name,
            price,
            stock,
            category_id: (formData.get("category_id") as string) || null,
            description: (formData.get("description") as string)?.trim() || null,
            image_url: (formData.get("image_url") as string)?.trim() || null,
        }
    };
}

export async function createProduct(formData: FormData) {
    // 1. Cek authorization
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const supabase = auth.supabase!;

    // 2. Validasi input
    const validation = validateProductInput(formData);
    if (validation.error) return { error: validation.error };
    const { name, price, stock, category_id, description, image_url } = validation.data!;

    // 3. Insert produk
    const { error } = await supabase.from("products").insert({
        name,
        price,
        stock,
        category_id: category_id || null,
        description,
        image_url,
        is_active: true,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
    // 1. Cek authorization
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const supabase = auth.supabase!;

    // 2. Validasi ID
    if (!id || typeof id !== "string") {
        return { error: "ID produk tidak valid" };
    }

    // 3. Validasi input
    const validation = validateProductInput(formData);
    if (validation.error) return { error: validation.error };
    const { name, price, stock, category_id, description, image_url } = validation.data!;

    const is_active = formData.get("is_active") === "true";

    // 4. Update produk
    const { error } = await supabase
        .from("products")
        .update({
            name,
            price,
            stock,
            category_id: category_id || null,
            description,
            image_url,
            is_active,
        })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
}

export async function deleteProduct(id: string) {
    // 1. Cek authorization
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const supabase = auth.supabase!;

    // 2. Validasi ID
    if (!id || typeof id !== "string") {
        return { error: "ID produk tidak valid" };
    }

    // 3. Delete produk
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
}
