import type { ComponentType } from "react"
import { DollarSign, Package, Receipt, TrendingUp } from "lucide-react"

import { getMetricUnit } from "@/lib/report-chart-data"
import { formatNumber, type MetricItem } from "@/lib/report-parsers"
import { MetricCard } from "@/view/components/dashboard/metric-card"

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  totalSales: TrendingUp,
  sales: TrendingUp,
  revenue: TrendingUp,
  totalPurchases: Receipt,
  purchases: Receipt,
  totalExpenses: DollarSign,
  expenses: DollarSign,
  discountsGiven: Receipt,
  grossProfit: TrendingUp,
  netProfit: TrendingUp,
  profit: TrendingUp,
  marginPercent: TrendingUp,
  margin: TrendingUp,
  profitMargin: TrendingUp,
  negativeCount: Package,
  inventoryValue: Package,
  count: Package,
}

type ReportMetricsProps = {
  metrics: MetricItem[]
  defaultUnit?: string
}

export function ReportMetrics({ metrics, defaultUnit }: ReportMetricsProps) {
  if (metrics.length === 0) return null

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = ICONS[metric.key] ?? DollarSign
        const unit = defaultUnit ?? getMetricUnit(metric.key)

        return (
          <MetricCard
            key={metric.key}
            label={metric.label}
            value={formatNumber(metric.value)}
            unit={unit}
            icon={Icon}
            variant={index === 0 ? "highlight" : "default"}
          />
        )
      })}
    </section>
  )
}
