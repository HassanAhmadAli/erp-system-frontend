import { useMemo, useState } from "react"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useReportSummary } from "@/hooks/Reports/useReports"
import { extractStoreOverview } from "@/lib/report-chart-data"
import { currentYearMonth, yearMonthToApiRange } from "@/lib/report-parsers"
import { formatInteger, formatPrice } from "@/utils/number-formatters"
import { MetricCard } from "@/view/components/dashboard/metric-card"
import { SalesChartCard } from "@/view/components/dashboard/sales-chart-card"
import { TopProductsCard } from "@/view/components/dashboard/top-products-card"

const monthInputClass =
  "rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

function formatYearMonthLabel(yearMonth: string, language: string) {
  const [yearValue, monthValue] = yearMonth.split("-").map(Number)

  if (!yearValue || !monthValue) return yearMonth

  return new Intl.DateTimeFormat(language.startsWith("ar") ? "ar" : "en", {
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  }).format(new Date(yearValue, monthValue - 1, 1))
}

export function StoreManagerOverviewPage() {
  const { t, i18n } = useTranslation(["common", "pages"])
  const maxYearMonth = currentYearMonth()
  const [yearMonth, setYearMonth] = useState(maxYearMonth)
  const range = useMemo(() => yearMonthToApiRange(yearMonth), [yearMonth])
  const { data, isLoading, isError } = useReportSummary(range, {
    refetchInterval: 15_000,
  })
  const overview = extractStoreOverview(data)
  const periodLabel = formatYearMonthLabel(yearMonth, i18n.language)
  const metricValue = (value: number, format: "int" | "price") => {
    if (isLoading) return "—"
    return format === "int" ? formatInteger(value) : formatPrice(value)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="text-start">
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {t("overview.storeManager", { ns: "pages" })}
          </h1>
          <p className="mt-1 text-[var(--erp-muted)]">
            {t("overview.storeManagerSubtitle", { ns: "pages" })}
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--erp-muted)]">
            {t("overview.selectMonth", { ns: "pages" })}
          </span>
          <input
            type="month"
            className={monthInputClass}
            max={maxYearMonth}
            value={yearMonth}
            onChange={(event) => setYearMonth(event.target.value)}
          />
        </label>
      </header>

      {isError ? (
        <p className="text-red-500">{t("loadFailed")}</p>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={t("overview.customerCount", { ns: "pages" })}
              value={metricValue(overview.customerCount, "int")}
              icon={Users}
            />

            <MetricCard
              label={t("overview.orderCount", { ns: "pages" })}
              value={metricValue(overview.salesCount, "int")}
              icon={ShoppingCart}
            />

            <MetricCard
              label={t("overview.profits", { ns: "pages" })}
              value={metricValue(overview.netProfit, "price")}
              unit="SYP"
              icon={DollarSign}
            />

            <MetricCard
              label={t("overview.totalSales", { ns: "pages" })}
              value={metricValue(overview.revenue, "price")}
              unit="SYP"
              icon={Package}
              variant="highlight"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
            <TopProductsCard
              products={overview.topProducts}
              periodLabel={periodLabel}
              isLoading={isLoading}
            />
            <SalesChartCard
              weeks={overview.salesByWeek}
              isLoading={isLoading}
            />
          </section>
        </>
      )}
    </div>
  )
}
