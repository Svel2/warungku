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
function validateCategoryInput(name: string | null) {
    const trimmedName = name?.trim();

    if (!trimmedName || trimmedName.length < 2) {
        return { error: "Nama kategori minimal 2 karakter" };
    }
    if (trimmedName.length > 100) {
        return { error: "Nama kategori maksimal 100 karakter" };
    }

    return { error: null, name: trimmedName };
}

export async function createCategory(formData: FormData) {
    // 1. Cek authorization
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const supabase = auth.supabase!;

    // 2. Validasi input
    const validation = validateCategoryInput(formData.get("name") as string);
    if (validation.error) return { error: validation.error };
    const name = validation.name!;

    const description = (formData.get("description") as string)?.trim() || null;
    const icon = (formData.get("icon") as string)?.trim() || null;

    // 3. Cek nama kategori unik
    const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", name)
        .limit(1);

    if (existing && existing.length > 0) {
        return { error: "Nama kategori sudah digunakan" };
    }

    // 4. Insert kategori
    const { error } = await supabase.from("categories").insert({
        name,
        description,
        icon,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
    // 1. Cek authorization
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const supabase = auth.supabase!;

    // 2. Validasi ID
    if (!id || typeof id !== "string") {
        return { error: "ID kategori tidak valid" };
    }

    // 3. Validasi input
    const validation = validateCategoryInput(formData.get("name") as string);
    if (validation.error) return { error: validation.error };
    const name = validation.name!;

    const description = (formData.get("description") as string)?.trim() || null;
    const icon = (formData.get("icon") as string)?.trim() || null;

    // 4. Cek nama kategori unik (kecuali kategori ini sendiri)
    const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", name)
        .neq("id", id)
        .limit(1);

    if (existing && existing.length > 0) {
        return { error: "Nama kategori sudah digunakan" };
    }

    // 5. Update kategori
    const { error } = await supabase
        .from("categories")
        .update({ name, description, icon })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
}

export async function deleteCategory(id: string) {
    // 1. Cek authorization
    const auth = await requireAdmin();
    if (auth.error) return { error: auth.error };
    const supabase = auth.supabase!;

    // 2. Validasi ID
    if (!id || typeof id !== "string") {
        return { error: "ID kategori tidak valid" };
    }

    // 3. Cek apakah kategori memiliki produk
    const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

    if (count && count > 0) {
        return { error: `Tidak bisa hapus. Masih ada ${count} produk di kategori ini.` };
    }

    // 4. Delete kategori
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
}
