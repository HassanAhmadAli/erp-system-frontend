import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getOrder,
  getOrders,
  updateOrderStatus,
  type OrderStatus,
} from "@/services/orders-service"

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  })
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    enabled: Boolean(id),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
