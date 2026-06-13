import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createSalesInvoice,
    getSalesInvoice,
    getSalesInvoices,
    updateSalesInvoiceStatus,
    type CreateSalesInvoicePayload,
    type SalesInvoiceStatus,
} from "@/services/sales-invoices-service"

export function useSalesInvoices() {
    return useQuery({
        queryKey: ["sales-invoices"],
        queryFn: getSalesInvoices,
    })
}

export function useSalesInvoice(invoiceId: number) {
    return useQuery({
        queryKey: ["sales-invoice", invoiceId],
        queryFn: () => getSalesInvoice(invoiceId),
        enabled: Number.isFinite(invoiceId) && invoiceId > 0,
    })
}

export function useCreateSalesInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateSalesInvoicePayload) =>
            createSalesInvoice(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
        },
    })
}

export function useUpdateSalesInvoiceStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: number
            status: SalesInvoiceStatus
        }) => updateSalesInvoiceStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
            queryClient.invalidateQueries({
                queryKey: ["sales-invoice", variables.id],
            })
        },
    })
}