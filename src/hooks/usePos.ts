import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createSaleInvoice,
  getPosProducts,
  normalizePosProducts,
  type CreateSaleInvoicePayload,
} from "@/services/pos-service"
import { getCustomers, normalizeCustomers } from "@/services/customer-service"

export function usePosProducts() {
  return useQuery({
    queryKey: ["pos-products"],
    queryFn: async () => normalizePosProducts(await getPosProducts()),
  })
}

export function usePosCustomers() {
  return useQuery({
    queryKey: ["pos-customers"],
    queryFn: async () => normalizeCustomers(await getCustomers({ limit: 100 })),
    retry: false,
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
