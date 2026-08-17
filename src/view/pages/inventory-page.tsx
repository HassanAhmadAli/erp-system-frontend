import { AlertTriangle, Archive, Wallet } from "lucide-react"
import { useTranslation } from "react-i18next"

import { MetricCard } from "@/view/components/dashboard/metric-card"
import { ProductsTable } from "@/view/components/inventory/products-table"
import { formatNumber } from "@/utils/number-formatters"

export function InventoryPage() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header>
        <h2 className="text-3xl font-bold text-[var(--erp-text)]">
          {t("pages:inventory.overviewTitle")}
        </h2>
        <p className="mt-1 text-[var(--erp-muted)]">
          {t("pages:inventory.overviewSubtitle")}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label={t("pages:inventory.stockValue")}
          value={formatNumber(300000)}
          unit="SYP"
          icon={Wallet}
        />

        <MetricCard
          label={t("pages:inventory.lowStockProducts")}
          value={formatNumber(24)}
          unit={t("pages:inventory.unitProduct")}
          icon={AlertTriangle}
          variant="highlight"
        />

        <MetricCard
          label={t("pages:inventory.totalProductCount")}
          value={formatNumber(1272)}
          unit={t("pages:inventory.unitPiece")}
          icon={Archive}
        />
      </section>

      <ProductsTable />
    </div>
  )
}
