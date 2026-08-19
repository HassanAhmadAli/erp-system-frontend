import { ArrowRight, Percent } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useActiveDiscounts } from "@/hooks/use-discounts"
import { useLocale } from "@/i18n/locale-provider"
import { localizedName } from "@/lib/localized"
import {
  formatDiscountValue,
  getDiscountScopeLabel,
  getDiscountTypeLabel,
} from "@/lib/discount-labels"

export function ActiveDiscountsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const { data, isLoading, error } = useActiveDiscounts()
  const discounts = data?.data ?? []

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:discounts.activeTitle")}
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.activeSubtitle")}
          </p>
        </div>

        <Link
          to="/discounts"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("pages:discounts.backToDiscounts")}
        </Link>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {isLoading && (
          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.loadingActive")}
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {t("pages:discounts.loadActiveFailed")}
          </p>
        )}

        {!isLoading && !error && discounts.length === 0 && (
          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.noActive")}
          </p>
        )}

        {!isLoading && !error && discounts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {discounts.map((discount) => (
              <Link
                key={discount.id}
                to={`/discounts/${discount.id}`}
                className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-[var(--erp-text)] transition hover:border-[var(--erp-brand-solid)]"
              >
                <h2 className="font-bold text-[var(--erp-text)]">
                  {localizedName(discount, language)}
                </h2>

                <div className="mt-3 grid gap-2 text-sm text-[var(--erp-muted)]">
                  <p>
                    {t("pages:discounts.typeLabel")}:{" "}
                    {getDiscountTypeLabel(discount.type, t)}
                  </p>
                  <p>
                    {t("pages:discounts.valueLabel")}:{" "}
                    {formatDiscountValue(discount.type, discount.value)}
                  </p>
                  <p>
                    {t("pages:discounts.scopeLabel")}:{" "}
                    {getDiscountScopeLabel(discount.scope, t)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
