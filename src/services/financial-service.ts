import { apiRequest, buildQuery } from "@/api/client"

export type FinancialPagination = {
  limit?: number
  offset?: number
}

export type FinancialDateRange = FinancialPagination & {
  from?: string
  to?: string
}

export type CostTrendsParams = FinancialPagination & {
  productId?: number
}

export function getProfitMargins(params?: FinancialPagination) {
  return apiRequest<Record<string, unknown>>(
    `/financial/profit-margins${buildQuery(params)}`
  )
}

export function getCostBreakdown(params?: FinancialDateRange) {
  return apiRequest<Record<string, unknown>>(
    `/financial/cost-breakdown${buildQuery(params)}`
  )
}

export function getCostTrends(params?: CostTrendsParams) {
  return apiRequest<Record<string, unknown>>(
    `/financial/cost-trends${buildQuery(params)}`
  )
}

export function recalculateCosts(productIds: number[]) {
  return apiRequest<Record<string, unknown>>("/financial/recalculate-costs", {
    method: "POST",
    body: JSON.stringify({ productIds }),
  })
}

export function getSupplierReport(
  supplierId: number,
  params?: FinancialPagination
) {
  return apiRequest<Record<string, unknown>>(
    `/financial/supplier-report${buildQuery({ ...params, supplierId })}`
  )
}
