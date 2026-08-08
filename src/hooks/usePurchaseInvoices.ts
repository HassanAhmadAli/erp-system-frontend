import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createPurchaseInvoice,
  getPurchaseInvoice,
  getPurchaseInvoices,
  normalizePurchaseInvoicesList,
  updatePurchaseInvoiceStatus,
  type CreatePurchaseInvoicePayload,
  type PurchaseInvoiceStatus,
  type PurchaseInvoicesQuery,
} from "@/services/purchase-invoices-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"

export function usePurchaseInvoices(params?: PurchaseInvoicesQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["purchase-invoices", query],
    queryFn: async () =>
      normalizePurchaseInvoicesList(
        await getPurchaseInvoices({ ...params, ...query }),
        query.limit,
        query.offset
      ),
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
