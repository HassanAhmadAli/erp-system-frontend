import { useMutation, useQuery } from "@tanstack/react-query"

import {
  calculateDiscount,
  getActiveDiscounts,
  getBestDiscount,
  getDiscountById,
  getDiscounts,
  type BestDiscountParams,
  type CalculateDiscountParams,
  type DiscountScope,
  type DiscountType,
} from "@/services/discount-service"
import { isValidId } from "@/validation/helpers"

export function useActiveDiscounts() {
  return useQuery({
    queryKey: ["active-discounts"],
    queryFn: getActiveDiscounts,
  })
}

export function useDiscountById(id: number) {
  return useQuery({
    queryKey: ["discount", id],
    queryFn: () => getDiscountById(id),
    enabled: isValidId(id),
  })
}

export function useDiscounts(params?: {
  search?: string
  page?: number
  limit?: number
  type?: DiscountType
  scope?: DiscountScope
}) {
  return useQuery({
    queryKey: ["discounts", params],
    queryFn: () => getDiscounts(params),
  })
}

export function useBestDiscount() {
  return useMutation({
    mutationFn: (params: BestDiscountParams) => getBestDiscount(params),
  })
}

export function useCalculateDiscount() {
  return useMutation({
    mutationFn: (params: CalculateDiscountParams) => calculateDiscount(params),
  })
}