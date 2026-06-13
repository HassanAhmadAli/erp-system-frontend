import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { asList } from "@/lib/list-utils"
import {
  getSalesInvoiceById,
  getSalesInvoices,
  updateSalesInvoiceStatus,
  type SalesInvoiceStatus,
} from "@/services/sales-service"

export function useSalesInvoices() {
  return useQuery({
    queryKey: ["sales-invoices"],
    queryFn: async () => asList(await getSalesInvoices()),
  })
}

export function useSalesInvoiceById(id: number) {
  return useQuery({
    queryKey: ["sales-invoice", id],
    queryFn: () => getSalesInvoiceById(id),
    enabled: !!id,
  })
}

export function useUpdateSalesInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: SalesInvoiceStatus }) =>
      updateSalesInvoiceStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["sales-invoice", id] })
    },
  })
}
