import { apiRequest, apiRequestBlob, buildQuery } from "@/api/client"

export type ReportDateRange = {
  from?: string
  to?: string
}

export type ReportExportType =
  | "summary"
  | "profit-margins"
  | "sales"
  | "inventory"
  | "purchases"

export function getReportSummary(params?: ReportDateRange) {
  return apiRequest<Record<string, unknown>>(
    `/reports/summary${buildQuery(params)}`
  )
}

export function getReportDashboard(params?: ReportDateRange) {
  return apiRequest<Record<string, unknown>>(
    `/reports/dashboard${buildQuery(params)}`
  )
}

export function getReportInventory(params?: ReportDateRange) {
  return apiRequest<Record<string, unknown>>(
    `/reports/inventory${buildQuery(params)}`
  )
}

export function exportReport(type: ReportExportType, params?: ReportDateRange) {
  return apiRequestBlob(`/reports/export${buildQuery({ ...params, type })}`)
}
