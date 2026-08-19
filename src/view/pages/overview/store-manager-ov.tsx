import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import { MetricCard } from "@/view/components/dashboard/metric-card"
import { SalesChartCard } from "@/view/components/dashboard/sales-chart-card"
import { TopProductsCard } from "@/view/components/dashboard/top-products-card"

export function StoreManagerOverviewPage() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6">
      <header className="text-start">
        <h1 className="text-3xl font-bold text-[var(--erp-text)]">
          {t("overview.storeManager", { ns: "pages" })}
        </h1>
        <p className="mt-1 text-[var(--erp-muted)]">
          {t("overview.storeManagerSubtitle", { ns: "pages" })}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("overview.customerCount", { ns: "pages" })}
          value="47"
          icon={Users}
        />

        <MetricCard
          label={t("overview.orderCount", { ns: "pages" })}
          value="32"
          icon={ShoppingCart}
        />

        <MetricCard
          label={t("overview.profits", { ns: "pages" })}
          value="720"
          unit="SYP"
          icon={DollarSign}
        />

        <MetricCard
          label={t("overview.totalSales", { ns: "pages" })}
          value="60,000"
          unit="SYP"
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
