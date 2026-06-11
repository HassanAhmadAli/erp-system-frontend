import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createOrder,
    getOrder,
    getOrders,
    updateOrderStatus,
    type CreateOrderPayload,
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
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            updateOrderStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            queryClient.invalidateQueries({ queryKey: ["orders", variables.id] })
        },
    })
}