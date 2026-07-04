import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createPurchaseInvoice,
  getPurchaseInvoice,
  getPurchaseInvoices,
  updatePurchaseInvoiceStatus,
  type CreatePurchaseInvoicePayload,
  type PurchaseInvoiceStatus,
} from "@/services/purchase-invoices-service"
import { isValidId } from "@/validation/helpers"

export function usePurchaseInvoices() {
  return useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: getPurchaseInvoices,
  })
}

export function usePurchaseInvoice(invoiceId: number) {
  return useQuery({
    queryKey: ["purchase-invoice", invoiceId],
    queryFn: () => getPurchaseInvoice(invoiceId),
    enabled: isValidId(invoiceId),
  })
}

export function useCreatePurchaseInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePurchaseInvoicePayload) =>
      createPurchaseInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] })
    },
  })
}

export function useUpdatePurchaseInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number
      status: PurchaseInvoiceStatus
    }) => updatePurchaseInvoiceStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] })
      queryClient.invalidateQueries({
        queryKey: ["purchase-invoice", variables.id],
      })
    },
  })
}
