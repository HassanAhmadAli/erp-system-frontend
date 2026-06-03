import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
    getCustomers,
    getCustomer,
    updateCustomerStatus,
    updateCustomerLoyalty,
} from "@/services/customer-service"

export function useCustomers() {
    return useQuery({
        queryKey: ["customers"],
        queryFn: getCustomers,
    })
}

export function useCustomer(id: number) {
    return useQuery({
        queryKey: ["customers", id],
        queryFn: () => getCustomer(id),
        enabled: Number.isFinite(id),
    })
}

export function useUpdateCustomerStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            updateCustomerStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}

export function useUpdateCustomerLoyalty() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            loyaltyPoints,
        }: {
            id: number
            loyaltyPoints: number
        }) => updateCustomerLoyalty(id, loyaltyPoints),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] })
        },
    })
}