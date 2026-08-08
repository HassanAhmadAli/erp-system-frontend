import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { PaginatedResponse } from "@/api/client"
import {
  createSalesInvoice,
  getSalesInvoice,
  getSalesInvoices,
  normalizeSalesInvoicesList,
  updateSalesInvoiceStatus,
  type CreateSalesInvoicePayload,
  type SalesInvoice,
  type SalesInvoiceStatus,
  type SalesInvoicesQuery,
} from "@/services/sales-invoices-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"

function patchSalesInvoiceInLists(
  lists: PaginatedResponse<SalesInvoice> | undefined,
  updated: SalesInvoice
) {
  if (!lists) return lists

  return {
    ...lists,
    data: lists.data.map((invoice) =>
      invoice.id === updated.id
        ? {
            ...invoice,
            ...updated,
            status: updated.status,
          }
        : invoice
    ),
  }
}

export function useSalesInvoices(params?: SalesInvoicesQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["sales-invoices", query],
    queryFn: async () =>
      normalizeSalesInvoicesList(
        await getSalesInvoices({ ...params, ...query }),
        query.limit,
        query.offset
      ),
  })
}

export function useSalesInvoice(invoiceId: number) {
  return useQuery({
    queryKey: ["sales-invoice", invoiceId],
    queryFn: () => getSalesInvoice(invoiceId),
    enabled: isValidId(invoiceId),
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
    mutationFn: ({ id, status }: { id: number; status: SalesInvoiceStatus }) =>
      updateSalesInvoiceStatus(id, status),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["sales-invoice", variables.id], updated)
      queryClient.setQueriesData<PaginatedResponse<SalesInvoice>>(
        { queryKey: ["sales-invoices"] },
        (current) => patchSalesInvoiceInLists(current, updated)
      )
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
      queryClient.invalidateQueries({
        queryKey: ["sales-invoice", variables.id],
      })
    },
  })
}
