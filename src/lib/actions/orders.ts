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
        price: number; // Ini akan diverifikasi dari server
    }[];
    total_amount: number; // Ini akan dihitung ulang dari server
}

interface ProductWithStock {
    id: string;
    name: string;
    price: number;
    stock: number;
    is_active: boolean;
}

export async function createOrder(params: CreateOrderParams) {
    const supabase = await createClient();

    // 1. Validasi input dasar
    if (!params.customer_name?.trim()) {
        return { error: "Nama pelanggan wajib diisi" };
    }
    if (!params.customer_phone?.trim()) {
        return { error: "Nomor telepon wajib diisi" };
    }
    if (!params.items || params.items.length === 0) {
        return { error: "Keranjang belanja kosong" };
    }

    // 2. Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // 3. VALIDASI HARGA DAN STOK DARI SERVER (CRITICAL FIX)
    const productIds = params.items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, price, stock, is_active")
        .in("id", productIds);

    if (productsError || !products) {
        return { error: "Gagal memvalidasi produk" };
    }

    // Buat map untuk akses cepat
    const productMap = new Map<string, ProductWithStock>();
    products.forEach(p => productMap.set(p.id, p));

    // Validasi setiap item
    const validatedItems: { product_id: string; quantity: number; server_price: number; name: string }[] = [];
    let calculatedTotal = 0;

    for (const item of params.items) {
        const product = productMap.get(item.product_id);

        if (!product) {
            return { error: `Produk tidak ditemukan` };
        }

        if (!product.is_active) {
            return { error: `Produk "${product.name}" sudah tidak tersedia` };
        }

        if (item.quantity <= 0) {
            return { error: `Jumlah tidak valid untuk "${product.name}"` };
        }

        if (item.quantity > product.stock) {
            return {
                error: `Stok "${product.name}" tidak cukup. Tersedia: ${product.stock}, Diminta: ${item.quantity}`
            };
        }

        // Gunakan harga dari SERVER, bukan dari client
        validatedItems.push({
            product_id: product.id,
            quantity: item.quantity,
            server_price: product.price,
            name: product.name
        });

        calculatedTotal += product.price * item.quantity;
    }

    // 4. Create Order dengan total yang dihitung server
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            user_id: user?.id || null,
            customer_name: params.customer_name.trim(),
            customer_phone: params.customer_phone.trim(),
            customer_address: params.customer_address?.trim() || null,
            total_amount: calculatedTotal, // Gunakan harga dari server!
            status: 'pending'
        })
        .select()
        .single();

    if (orderError) {
        return { error: orderError.message };
    }

    // 5. Create Order Items dengan harga dari server
    const orderItems = validatedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.server_price // Harga dari server!
    }));

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

    if (itemsError) {
        // Rollback: hapus order
        await supabase.from("orders").delete().eq("id", order.id);
        return { error: "Gagal menyimpan item pesanan" };
    }

    // 6. Update Stock dengan pengecekan ulang (prevent race condition)
    const stockUpdateErrors: string[] = [];

    for (const item of validatedItems) {
        // Gunakan RPC untuk atomic update, dengan fallback manual
        const { error: rpcError } = await supabase.rpc('decrement_stock', {
            product_id: item.product_id,
            qty: item.quantity
        });

        // Jika RPC tidak ada atau gagal, gunakan manual update dengan pengecekan
        if (rpcError) {
            // Ambil stok terkini
            const { data: currentProduct, error: fetchError } = await supabase
                .from("products")
                .select("stock")
                .eq("id", item.product_id)
                .single();

            if (fetchError || !currentProduct) {
                stockUpdateErrors.push(`Gagal update stok: ${item.name}`);
                continue;
            }

            const newStock = currentProduct.stock - item.quantity;

            // Update dengan kondisi untuk mencegah race condition
            const { error: updateError } = await supabase
                .from("products")
                .update({
                    stock: Math.max(0, newStock),
                    updated_at: new Date().toISOString()
                })
                .eq("id", item.product_id)
                .gte("stock", item.quantity); // Hanya update jika stok masih cukup

            if (updateError) {
                stockUpdateErrors.push(`Gagal update stok: ${item.name}`);
            }
        }
    }

    // Log jika ada error stok (tapi order tetap sukses)
    if (stockUpdateErrors.length > 0) {
        console.error("Stock update errors:", stockUpdateErrors);
    }

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/profile");

    return {
        success: true,
        orderId: order.id,
        totalAmount: calculatedTotal
    };
}
