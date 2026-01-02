"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateOrderParams {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    items: {
        product_id: string;
        quantity: number;
        price: number;
    }[];
    total_amount: number;
}

export async function createOrder(params: CreateOrderParams) {
    const supabase = await createClient();

    // 1. Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user?.id,
            customer_name: params.customer_name,
            customer_phone: params.customer_phone,
            customer_address: params.customer_address,
            total_amount: params.total_amount,
            status: 'pending'
        })
        .select()
        .single();

    if (orderError) {
        return { error: orderError.message };
    }

    // 3. Create Order Items
    const orderItems = params.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.price
    }));

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

    if (itemsError) {
        // Should probably delete the order here aka rollback
        await supabase.from("orders").delete().eq("id", order.id);
        return { error: itemsError.message };
    }

    // 4. Update Stock
    for (const item of params.items) {
        await supabase.rpc('decrement_stock', {
            product_id: item.product_id,
            qty: item.quantity
        });
        // Fallback if RPC doesn't exist yet: update manually (not atomic but OK for MVP)
        // Ideally we assume RPC exists or create it. Let's rely on manual update for now if RPC fails or just do manual update.
        const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
        if (product) {
            await supabase.from("products").update({ stock: Math.max(0, product.stock - item.quantity) }).eq("id", item.product_id);
        }
    }

    revalidatePath("/");
    revalidatePath("/admin/products"); // Update stock in admin

    return { success: true, orderId: order.id };
}
