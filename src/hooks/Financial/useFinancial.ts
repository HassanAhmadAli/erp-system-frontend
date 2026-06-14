import { useMutation, useQuery } from "@tanstack/react-query"

import {
  getCostBreakdown,
  getCostTrends,
  getProfitMargins,
  getSupplierReport,
  recalculateCosts,
  type CostTrendsParams,
  type FinancialDateRange,
  type FinancialPagination,
} from "@/services/financial-service"

export function useProfitMargins(params?: FinancialPagination) {
  return useQuery({
    queryKey: ["profit-margins", params],
    queryFn: () => getProfitMargins(params),
  })
}

export function useCostBreakdown(params?: FinancialDateRange) {
  return useQuery({
    queryKey: ["cost-breakdown", params],
    queryFn: () => getCostBreakdown(params),
  })
}

export function useCostTrends(params?: CostTrendsParams) {
  return useQuery({
    queryKey: ["cost-trends", params],
    queryFn: () => getCostTrends(params),
  })
}

export function useSupplierReport(
  supplierId: number,
  params?: FinancialPagination
) {
  return useQuery({
    queryKey: ["supplier-report", supplierId, params],
    queryFn: () => getSupplierReport(supplierId, params),
    enabled: !!supplierId,
  })
}

export function useRecalculateCosts() {
  return useMutation({
    mutationFn: (productIds: number[]) => recalculateCosts(productIds),
  })
}
