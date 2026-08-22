import { type FormEvent, useState } from "react"
import { ArrowRight, BadgePercent, Percent } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useBestDiscount } from "@/hooks/use-discounts"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useLocale } from "@/i18n/locale-provider"
import { localized, localizedName } from "@/lib/localized"
import {
  getDiscountScopeLabel,
  getDiscountTypeLabel,
} from "@/lib/discount-labels"
import type { BestDiscountResponse } from "@/services/discount-service"
import {
  bestDiscountSchema,
  bestDiscountValuesToPayload,
} from "@/validation/discount-helper-schema"
import { formatCurrency, formatId } from "@/utils/number-formatters"
import { ProductSearchSelect } from "@/view/components/financial/product-search-select"
import { Button } from "@/view/components/ui/button"

type TargetType = "GLOBAL" | "CATEGORY" | "PRODUCT"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const selectClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

export function BestDiscountPage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const [subtotal, setSubtotal] = useState("")
  const [targetType, setTargetType] = useState<TargetType>("GLOBAL")
  const [categoryId, setCategoryId] = useState("")
  const [productId, setProductId] = useState("")
  const [message, setMessage] = useState("")

  const bestDiscount = useBestDiscount()

  const { data: categoriesData } = useCategoriesForSelect()

  const categories = categoriesData?.data ?? []

  const result = bestDiscount.data

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const validationResult = bestDiscountSchema.safeParse({
      subtotal,
      targetType,
      categoryId,
      productId,
    })

    if (!validationResult.success) {
      setMessage(
        validationResult.error.issues[0]?.message || t("common:invalidData")
      )
      return
    }

    bestDiscount.mutate(bestDiscountValuesToPayload(validationResult.data))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:discounts.bestTitle")}
            </h1>
            <BadgePercent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.bestSubtitle")}
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

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
        >
          <div>
            <label className={labelClass}>
              {t("pages:discounts.invoiceTotal")}
            </label>
            <input
              type="number"
              value={subtotal}
              onChange={(event) => setSubtotal(event.target.value)}
              placeholder={t("common:exampleAmount")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("pages:discounts.searchScope")}
            </label>
            <select
              value={targetType}
              onChange={(event) => {
                setTargetType(event.target.value as TargetType)
                setCategoryId("")
                setProductId("")
              }}
              className={selectClass}
            >
              <option value="GLOBAL">{t("common:global")}</option>
              <option value="CATEGORY">{t("common:scopeByCategory")}</option>
              <option value="PRODUCT">{t("common:scopeByProduct")}</option>
            </select>
            <p className="mt-2 text-xs text-[var(--erp-muted)]">
              {t("pages:discounts.bestScopeHint")}
            </p>
          </div>

          {targetType === "CATEGORY" && (
            <div>
              <label className={labelClass}>{t("common:category")}</label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={selectClass}
              >
                <option value="">{t("common:selectCategory")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {localizedName(category, language)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === "PRODUCT" && (
            <ProductSearchSelect
              value={productId}
              onChange={setProductId}
              includeAllOption={false}
              className="relative w-full"
              label={t("common:product")}
            />
          )}

          {message && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
              {message}
            </p>
          )}

          {bestDiscount.isError && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
              {t("pages:discounts.fetchBestFailed")}
            </p>
          )}

          <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
            <Button type="submit" disabled={bestDiscount.isPending}>
              {bestDiscount.isPending
                ? t("pages:discounts.searching")
                : t("pages:discounts.searchBest")}
            </Button>
          </div>
        </form>

        <BestDiscountResultCard
          result={result}
          isSuccess={bestDiscount.isSuccess}
        />
      </section>
    </div>
  )
}

function BestDiscountResultCard({
  result,
  isSuccess,
}: {
  result: BestDiscountResponse | undefined
  isSuccess: boolean
}) {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()

  if (!isSuccess) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
          <Percent className="mb-3 size-10 text-[var(--erp-brand-solid)]" />
          <h2 className="text-lg font-bold text-[var(--erp-text)]">
            {t("pages:discounts.resultTitle")}
          </h2>
          <p className="mt-2 text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.resultHint")}
          </p>
        </div>
      </section>
    )
  }

  if (!result) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-center text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <Percent className="mx-auto mb-3 size-10 text-[var(--erp-muted)]" />

        <h2 className="text-lg font-bold text-[var(--erp-text)]">
          {t("pages:discounts.noDiscount")}
        </h2>

        <p className="mt-2 text-sm text-[var(--erp-muted)]">
          {t("pages:discounts.noDiscountHint")}
        </p>
      </section>
    )
  }

  const name = localized(result.discountName, result.discountNameAr, language)
  const discountAmount = result.discountAmount
  const finalAmount = result.total

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h2 className="mb-4 text-xl font-bold text-[var(--erp-text)]">
        {t("pages:discounts.bestDiscountTitle")}
      </h2>

      <div className="space-y-3">
        <ResultRow
          label={t("common:discountName")}
          value={name || t("common:unavailable")}
        />

        <ResultRow
          label={t("common:discountId")}
          value={`#${formatId(result.discountId)}`}
        />

        <ResultRow
          label={t("common:type")}
          value={getDiscountTypeLabel(result.type, t)}
        />

        <ResultRow
          label={t("common:scope")}
          value={getDiscountScopeLabel(result.scope, t)}
        />

        <ResultRow
          label={t("common:subtotal")}
          value={
            result.subtotal != null
              ? formatCurrency(String(result.subtotal))
              : t("common:unavailable")
          }
        />

        <ResultRow
          label={t("common:discountValue")}
          value={
            discountAmount != null
              ? formatCurrency(String(discountAmount))
              : t("common:unavailable")
          }
        />

        <ResultRow
          label={t("pages:discounts.finalAmountAfterDiscount")}
          value={
            finalAmount != null
              ? formatCurrency(String(finalAmount))
              : t("common:unavailable")
          }
        />

        <Link to={`/discounts/${result.discountId}`}>
          <Button variant="outline" className="mt-2 w-full">
            {t("pages:discounts.viewDiscountDetails")}
          </Button>
        </Link>
      </div>
    </section>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-1 font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}
