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
  const pagination = toPaginationQuery(params ?? { limit: 100 })
  const query = {
    ...pagination,
    status: params?.status,
    supplierId: params?.supplierId,
    from: params?.from,
    to: params?.to,
  }

  return useQuery({
    queryKey: ["purchase-invoices", query],
    queryFn: async () =>
      normalizePurchaseInvoicesList(
        await getPurchaseInvoices({ ...params, ...pagination }),
        pagination.limit,
        pagination.offset
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
