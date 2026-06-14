import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createSaleInvoice,
    getPosProducts,
    type CreateSaleInvoicePayload,
} from "@/services/pos-service"

export function usePosProducts() {
    return useQuery({
        queryKey: ["pos-products"],
        queryFn: getPosProducts,
    })
}

export function useCreateSaleInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateSaleInvoicePayload) =>
            createSaleInvoice(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
            queryClient.invalidateQueries({ queryKey: ["pos-products"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })
}