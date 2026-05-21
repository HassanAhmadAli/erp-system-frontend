import { Archive, AlertTriangle, Wallet } from "lucide-react"

import { MetricCard } from "@/view/components/dashboard/metric-card"
import { ProductsTable } from "@/view/components/inventory/products-table"

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <header className="text-right">
        <h2 className="text-3xl font-bold">نظرة عامة عن المخزون</h2>
        <p className="text-[var(--erp-muted)]">إليك ملخص عن المخزون</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="قيمة المخزون"
          value="300,000"
          unit="sp"
          icon={Wallet}
        />
        <MetricCard
          label="منتجات منخفضة المخزون"
          value="24"
          unit="prod"
          icon={AlertTriangle}
          variant="highlight"
        />
        <MetricCard
          label="إجمالي عدد المنتجات"
          value="1272"
          unit="pcs"
          icon={Archive}
        />
      </section>

      <ProductsTable />
    </div>
  )
}
