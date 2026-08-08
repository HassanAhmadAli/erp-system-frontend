import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  getCustomers,
  getCustomer,
  normalizeCustomersList,
  updateCustomerStatus,
  updateCustomerLoyalty,
  type CustomerStatus,
  type CustomersQuery,
} from "@/services/customer-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"

export function useCustomers(params?: CustomersQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["customers", query],
    queryFn: async () =>
      normalizeCustomersList(
        await getCustomers({ ...params, ...query }),
        query.limit,
        query.offset
      ),
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => getCustomer(id),
    enabled: isValidId(id),
  })
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: CustomerStatus }) =>
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
