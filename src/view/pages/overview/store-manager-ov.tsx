import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

import { MetricCard } from "@/view/components/dashboard/metric-card"
import { SalesChartCard } from "@/view/components/dashboard/sales-chart-card"
import { TopProductsCard } from "@/view/components/dashboard/top-products-card"

export function StoreManagerOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="text-right">
        <h1 className="text-3xl font-bold">نظرة عامة</h1>
        <p className="text-[var(--erp-muted)]">
          ملخص لأداء المتجر والأنشطة الرئيسية
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="عدد العملاء" value="47" icon={Users} />

        <MetricCard label="عدد الطلبات" value="32" icon={ShoppingCart} />

        <MetricCard label="الأرباح" value="720" unit="SP" icon={DollarSign} />

        <MetricCard
          label="إجمالي المبيعات"
          value="60,000"
          unit="SP"
          icon={Package}
          variant="highlight"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <TopProductsCard />
        <SalesChartCard />
      </section>
    </div>
  )
}
