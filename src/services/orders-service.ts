import { apiRequest } from "@/api/client"

export type OrderStatus = "PENDING" | "PREPARING" | string

export type OrderItem = {
    id: number
    orderId: number
    productId: number
    quantity: number
    unitPrice: string
    subtotal: string
    product?: {
        id: number
        name: string
        barcode: string
    }
}

export type Order = {
    id: number
    customerId: number
    appliedDiscountId: number | null
    subtotal: string
    discountAmount: string
    total: string
    loyaltyPointsUsed: number
    deliveryAddress: string
    status: OrderStatus
    createdAt: string
    updatedAt: string
    items?: OrderItem[]
    customer?: {
        id: number
        userId: number
        address: string
        loyaltyPoints: number
        totalSpent: string
        user?: {
            id: number
            fullName: string
            email: string
        }
    }
    appliedDiscount?: unknown
}

export type OrdersResponse = {
    data: Order[]
    total: number
    limit: number
    offset: number
    isFinalPage: boolean
}

export type CreateOrderPayload = {
    customerId: number
    discountId: number | null
    loyaltyPointsUsed: number
    deliveryAddress: string
    items: {
        productId: number
        quantity: number
    }[]
}

export async function getOrders() {
    return apiRequest<OrdersResponse>("/orders/cashier/")
}

export async function getOrder(id: number) {
    return apiRequest<Order>(`/orders/cashier/${id}`)
}

export async function createOrder(payload: CreateOrderPayload) {
    return apiRequest<Order>("/orders/cashier/", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export async function updateOrderStatus(id: number, status: string) {
    return apiRequest<Order>(`/orders/cashier/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    })
}