import { useTranslation } from "react-i18next"

import { formatInteger } from "@/utils/number-formatters"
import type { StoreOverviewWeek } from "@/lib/report-chart-data"

type SalesChartCardProps = {
  weeks: StoreOverviewWeek[]
  isLoading?: boolean
}

const BAR_MAX_HEIGHT = 200

export function SalesChartCard({
  weeks,
  isLoading = false,
}: SalesChartCardProps) {
  const { t } = useTranslation(["common", "pages"])
  const maxSales = Math.max(0, ...weeks.map((week) => week.salesCount))

  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h3 className="mb-6 text-center text-xl font-bold">
        {t("overview.salesChart", { ns: "pages" })}
      </h3>

      {isLoading ? (
        <p className="text-center text-sm text-[var(--erp-muted)]">
          {t("loading")}
        </p>
      ) : weeks.length === 0 ? (
        <p className="text-center text-sm text-[var(--erp-muted)]">
          {t("overview.noSalesThisMonth", { ns: "pages" })}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[420px] items-end gap-3"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map((week) => {
              const height =
                week.salesCount <= 0 || maxSales <= 0
                  ? 0
                  : Math.max(
                      8,
                      Math.round((week.salesCount / maxSales) * BAR_MAX_HEIGHT)
                    )

              return (
                <div
                  key={week.week}
                  className="flex flex-col items-center gap-3"
                >
                  <span className="text-sm font-semibold text-[var(--erp-text)]">
                    {formatInteger(week.salesCount)}
                  </span>

                  <div
                    className="w-8 rounded-full bg-[var(--erp-brand-solid)]"
                    style={{ height: `${height}px` }}
                  />

                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    {t("overview.week", { ns: "pages", n: week.week })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
