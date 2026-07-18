import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  getCustomers,
  getCustomer,
  updateCustomerStatus,
  updateCustomerLoyalty,
  type CustomerStatus,
} from "@/services/customer-service"
import { isValidId } from "@/validation/helpers"

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => getCustomers(),
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
