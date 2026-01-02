"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string || null;
    const icon = formData.get("icon") as string || null;

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
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string || null;
    const icon = formData.get("icon") as string || null;

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
    const supabase = await createClient();

    // Check if category has products
    const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

    if (count && count > 0) {
        return { error: `Tidak bisa hapus. Masih ada ${count} produk di kategori ini.` };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
}
