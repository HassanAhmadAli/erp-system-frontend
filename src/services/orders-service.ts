import { apiRequest } from "@/api/client"

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"

export type OrderProduct = {
  id: number
  name: string
}

export type OrderItem = {
  id: number
  productId: number
  quantity: number
  unitPrice?: string
  subtotal?: string
  price?: string
  product?: OrderProduct
}

export type OrderCustomerUser = {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  isActive?: boolean
}

export type OrderCustomer = {
  id: number
  userId?: number
  address?: string
  loyaltyPoints?: number
  totalSpent?: string
  user?: OrderCustomerUser
}

export type Order = {
  id: number
  customerId?: number
  discountId?: number | null
  appliedDiscountId?: number | null
  loyaltyPointsUsed: number
  deliveryAddress?: string | null
  status: OrderStatus
  subtotal?: string
  total?: string
  discountAmount?: string
  createdAt?: string
  updatedAt?: string
  items?: OrderItem[]
  customer?: OrderCustomer
}

export type OrdersResponse =
  | Order[]
  | {
    data: Order[]
    total?: number
    limit?: number
    offset?: number
    isFinalPage?: boolean
  }

export type CreateOrderItem = {
  productId: number
  quantity: number
}

export type CreateOrderPayload = {
  customerId: number
  discountId: number | null
  loyaltyPointsUsed: number
  deliveryAddress: string
  items: CreateOrderItem[]
}

export function normalizeOrders(response?: OrdersResponse) {
  if (!response) return []

  if (Array.isArray(response)) {
    return response
  }

  return response.data ?? []
}

export async function getOrders() {
  const response = await apiRequest<OrdersResponse>("/orders/cashier/")
  return normalizeOrders(response)
}

export async function createOrder(payload: CreateOrderPayload) {
  return apiRequest<Order>("/orders/cashier/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getOrder(id: number) {
  return apiRequest<Order>(`/orders/cashier/${id}`)
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  return apiRequest<Order>(`/orders/cashier/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
