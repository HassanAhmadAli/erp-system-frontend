import { useTranslation } from "react-i18next"

import { localized } from "@/lib/localized"
import type { StoreOverviewTopProduct } from "@/lib/report-chart-data"
import { formatInteger, formatPrice } from "@/utils/number-formatters"

type TopProductsCardProps = {
  products: StoreOverviewTopProduct[]
  periodLabel: string
  isLoading?: boolean
}

export function TopProductsCard({
  products,
  periodLabel,
  isLoading = false,
}: TopProductsCardProps) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">
          {t("overview.topProducts", { ns: "pages" })}
        </h3>
        <span className="rounded-full bg-[var(--erp-bg)] px-3 py-1 text-xs font-medium text-[var(--erp-muted)]">
          {periodLabel}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--erp-muted)]">{t("loading")}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-[var(--erp-muted)]">
          {t("overview.noTopProducts", { ns: "pages" })}
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-3 transition-colors dark:bg-white/[0.04]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--erp-brand)] text-sm font-bold text-white">
                  {index + 1}
                </div>

                <div className="min-w-0 text-start">
                  <p className="truncate font-semibold text-[var(--erp-text)]">
                    {localized(product.name, product.nameAr)}
                  </p>
                  <p className="truncate text-sm text-[var(--erp-muted)]">
                    {formatPrice(product.revenue)} SYP
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-left">
                <p className="text-3xl leading-none font-bold text-[var(--erp-brand-solid)]">
                  {formatInteger(product.quantitySold)}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--erp-muted)]">
                  {t("overview.sold", { ns: "pages" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
