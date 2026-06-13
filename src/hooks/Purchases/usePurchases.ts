import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { asList } from "@/lib/list-utils"
import {
  createPurchaseInvoice,
  getPurchaseInvoiceById,
  getPurchaseInvoices,
  updatePurchaseInvoiceStatus,
  type CreatePurchaseInvoiceInput,
  type PurchaseInvoiceStatus,
} from "@/services/purchase-service"

export function usePurchaseInvoices() {
  return useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: async () => asList(await getPurchaseInvoices()),
  })
}

export function usePurchaseInvoiceById(id: number) {
  return useQuery({
    queryKey: ["purchase-invoice", id],
    queryFn: () => getPurchaseInvoiceById(id),
    enabled: !!id,
  })
}

export function useCreatePurchaseInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePurchaseInvoiceInput) =>
      createPurchaseInvoice(data),
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["purchase-invoice", id] })
    },
  })
}
