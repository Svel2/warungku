"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const category_id = formData.get("category_id") as string || null;
    const description = formData.get("description") as string || null;
    const image_url = formData.get("image_url") as string || null;

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
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const category_id = formData.get("category_id") as string || null;
    const description = formData.get("description") as string || null;
    const image_url = formData.get("image_url") as string || null;
    const is_active = formData.get("is_active") === "true";

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
    const supabase = await createClient();

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
}
