import { apiRequest } from "@/api/client"

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
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
  loyaltyPointsUsed: number
  deliveryAddress?: string | null
  status: OrderStatus
  total?: string
  createdAt?: string
  updatedAt?: string
  items?: OrderItem[]
  customer?: OrderCustomer
}

export async function getOrders() {
  return apiRequest<Order[]>("/orders/cashier/")
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
