import { useMutation, useQuery } from "@tanstack/react-query"

import {
  exportReport,
  getReportDashboard,
  getReportInventory,
  getReportSummary,
  type ReportDateRange,
  type ReportExportType,
} from "@/services/report-service"

export function useReportSummary(params?: ReportDateRange) {
  return useQuery({
    queryKey: ["report-summary", params],
    queryFn: () => getReportSummary(params),
  })
}

export function useReportDashboard(params?: ReportDateRange) {
  return useQuery({
    queryKey: ["report-dashboard", params],
    queryFn: () => getReportDashboard(params),
  })
}

export function useReportInventory(params?: ReportDateRange) {
  return useQuery({
    queryKey: ["report-inventory", params],
    queryFn: () => getReportInventory(params),
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      params,
    }: {
      type: ReportExportType
      params?: ReportDateRange
    }) => exportReport(type, params),
  })
}
