import { useMutation, useQuery } from "@tanstack/react-query"

import {
  getDiscounts,
  getActiveDiscounts,
  getDiscountById,
  getBestDiscount,
  calculateDiscount,
  type DiscountType,
  type DiscountScope,
  type BestDiscountParams,
  type CalculateDiscountParams,
} from "@/services/discount-service"

/* ========================================
   GET ALL
======================================== */

// export function useDiscounts() {
//   return useQuery({
//     queryKey: ["discounts"],
//     queryFn: getDiscounts,
//   })
// }

/* ========================================
   GET ACTIVE
======================================== */

export function useActiveDiscounts() {
  return useQuery({
    queryKey: ["active-discounts"],
    queryFn: getActiveDiscounts,
  })
}

/* ========================================
   GET BY ID
======================================== */

export function useDiscountById(id: number) {
  return useQuery({
    queryKey: ["discount", id],
    queryFn: () => getDiscountById(id),
    enabled: !!id,
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

/* ========================================
   GET BEST DISCOUNT (mutation)
======================================== */

export function useBestDiscount() {
  return useMutation({
    mutationFn: (params: BestDiscountParams) => getBestDiscount(params),
  })
}

/* ========================================
   CALCULATE DISCOUNT (mutation)
======================================== */

export function useCalculateDiscount() {
  return useMutation({
    mutationFn: (params: CalculateDiscountParams) => calculateDiscount(params),
  })
}
