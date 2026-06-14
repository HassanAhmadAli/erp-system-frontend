import type { PosProduct } from "@/services/pos-service"

export type CartItem = {
    product: PosProduct
    quantity: number
}