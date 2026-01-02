export type Category = {
    id: string
    name: string
    description: string | null
    icon: string | null
    created_at: string
    updated_at: string
}

export type Product = {
    id: string
    category_id: string | null
    name: string
    description: string | null
    price: number
    stock: number
    image_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined category
    category?: Category
}

export type Database = {
    public: {
        Tables: {
            categories: {
                Row: Category
                Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
            }
            products: {
                Row: Product
                Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>
                Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>>
            }
            orders: {
                Row: {
                    id: string
                    user_id: string | null
                    customer_name: string
                    customer_phone: string
                    customer_address: string | null
                    total_amount: number
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    customer_name: string
                    customer_phone: string
                    customer_address?: string | null
                    total_amount: number
                    status?: string
                    created_at?: string
                }
                Update: Partial<{
                    user_id: string | null
                    customer_name: string
                    customer_phone: string
                    customer_address: string | null
                    total_amount: number
                    status: string
                }>
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string | null
                    quantity: number
                    price_at_time: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id?: string | null
                    quantity: number
                    price_at_time: number
                    created_at?: string
                }
                Update: Partial<{
                    order_id: string
                    product_id: string | null
                    quantity: number
                    price_at_time: number
                }>
            }
        }
    }
}
