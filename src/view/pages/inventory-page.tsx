import { AlertTriangle, Archive, Wallet } from "lucide-react"

import { MetricCard } from "@/view/components/dashboard/metric-card"
import { ProductsTable } from "@/view/components/inventory/products-table"
import { formatNumber } from "@/utils/number-formatters"

export function InventoryPage() {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]">
      <header>
        <h2 className="text-3xl font-bold text-[var(--erp-text)]">
          نظرة عامة عن المخزون
        </h2>
        <p className="mt-1 text-[var(--erp-muted)]">إليك ملخص عن المخزون</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="قيمة المخزون"
          value={formatNumber(300000)}
          unit="SYP"
          icon={Wallet}
        />

        <MetricCard
          label="منتجات منخفضة المخزون"
          value={formatNumber(24)}
          unit="منتج"
          icon={AlertTriangle}
          variant="highlight"
        />

        <MetricCard
          label="إجمالي عدد المنتجات"
          value={formatNumber(1272)}
          unit="قطعة"
          icon={Archive}
        />
      </section>

      <ProductsTable />
    </div>
  )
}
