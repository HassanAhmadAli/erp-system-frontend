import { ArrowRight, Percent } from "lucide-react"
import { Link } from "react-router-dom"

import { useActiveDiscounts } from "@/hooks/use-discounts"
import type { DiscountScope, DiscountType } from "@/services/discount-service"
import { formatNumber } from "@/utils/number-formatters"

function getDiscountTypeLabel(type: DiscountType) {
  return type === "PERCENTAGE" ? "نسبة مئوية" : "مبلغ ثابت"
}

function getDiscountScopeLabel(scope: DiscountScope) {
  const labels: Record<DiscountScope, string> = {
    GLOBAL: "عام",
    CATEGORY: "تصنيف",
    PRODUCT: "منتج",
  }

  return labels[scope]
}

function formatDiscountValue(type: DiscountType, value: string) {
  const formattedValue = formatNumber(value)

  return type === "PERCENTAGE" ? `${formattedValue}%` : `${formattedValue} SYP`
}

export function ActiveDiscountsPage() {
  const { data, isLoading, error } = useActiveDiscounts()
  const discounts = data?.data ?? []

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              الخصومات الفعالة
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            الخصومات المتاحة حالياً للاستخدام.
          </p>
        </div>

        <Link
          to="/discounts"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى الخصومات
        </Link>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {isLoading && (
          <p className="text-sm text-[var(--erp-muted)]">
            جاري تحميل الخصومات الفعالة...
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            فشل تحميل الخصومات الفعالة.
          </p>
        )}

        {!isLoading && !error && discounts.length === 0 && (
          <p className="text-sm text-[var(--erp-muted)]">
            لا توجد خصومات فعالة حالياً.
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
                  {discount.name}
                </h2>

                <div className="mt-3 grid gap-2 text-sm text-[var(--erp-muted)]">
                  <p>النوع: {getDiscountTypeLabel(discount.type)}</p>
                  <p>
                    القيمة: {formatDiscountValue(discount.type, discount.value)}
                  </p>
                  <p>النطاق: {getDiscountScopeLabel(discount.scope)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}