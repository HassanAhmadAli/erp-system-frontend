import { useState } from "react"

import { useSupplierReport } from "@/hooks/Financial/useFinancial"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import {
  extractSupplierReportMetrics,
  extractTimeSeries,
} from "@/lib/report-chart-data"
import { extractTableRows, toNumber } from "@/lib/report-parsers"
import { BarChart } from "@/view/components/charts/bar-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function SupplierReportPage() {
  const [supplierId, setSupplierId] = useState("")
  const { data: suppliersData } = useSuppliers()
  const suppliers = suppliersData?.data ?? []

  const id = supplierId ? Number(supplierId) : 0
  const { data, isLoading, isError } = useSupplierReport(id)

  const timeSeries = extractTimeSeries(data)
  const rows = extractTableRows(data)
  const metrics = extractSupplierReportMetrics(data)

  const amountBars = rows
    .map((row) => {
      const value =
        toNumber(row.amount) ?? toNumber(row.total) ?? toNumber(row.cost)
      if (value === null) return null
      const label = String(row.productName ?? row.name ?? row.period ?? row.id)
      return { label, value }
    })
    .filter((p): p is { label: string; value: number } => p !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <ReportLayout
      title="تقرير المورد"
      description="مشتريات المورد عبر الزمن ومقارنة المبالغ"
      backTo="/financial"
      backLabel="التحليل المالي"
      loading={!!supplierId && isLoading}
      error={!!supplierId && isError}
    >
      <div className="rounded-2xl border bg-[var(--erp-card)] p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--erp-muted)]">اختر المورد</span>
          <select
            className="max-w-md rounded-xl border px-3 py-2"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">— اختر مورداً —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!supplierId ? (
        <p className="rounded-2xl border bg-[var(--erp-card)] p-8 text-center text-[var(--erp-muted)]">
          اختر مورداً لعرض التقرير
        </p>
      ) : (
        <>
          <ReportMetrics metrics={metrics} />

          {timeSeries.length >= 2 ? (
            <LineChart
              title="مشتريات المورد عبر الزمن"
              data={timeSeries}
              unit="SP"
            />
          ) : (
            <BarChart title="مبالغ المشتريات" data={amountBars} unit="SP" />
          )}

          <ReportTable title="تفاصيل المعاملات" rows={rows} />
        </>
      )}
    </ReportLayout>
  )
}
