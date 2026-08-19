import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createOrder,
  getOrder,
  getOrders,
  normalizeOrdersList,
  updateOrderStatus,
  type CreateOrderPayload,
  type OrdersQuery,
  type OrderStatus,
} from "@/services/orders-service"
import { toPaginationQuery } from "@/lib/pagination"

export function useOrders(params?: OrdersQuery) {
  const query = toPaginationQuery(params)

  return useQuery({
    queryKey: ["orders", query],
    queryFn: async () =>
      normalizeOrdersList(await getOrders(params), query.limit, query.offset),
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] })
    },
  })
}
