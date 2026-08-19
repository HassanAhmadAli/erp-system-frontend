import { type FormEvent, useState } from "react"
import { ArrowRight, Calculator, Percent } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useCalculateDiscount } from "@/hooks/use-discounts"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"
import { useLocale } from "@/i18n/locale-provider"
import { localizedName } from "@/lib/localized"
import { normalizeProducts } from "@/services/product-service"
import {
  calculateDiscountSchema,
  calculateDiscountValuesToPayload,
} from "@/validation/discount-helper-schema"
import { formatCurrency } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

type TargetType = "NONE" | "CATEGORY" | "PRODUCT"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const selectClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

export function CalculateDiscountPage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const [discountId, setDiscountId] = useState("")
  const [subtotal, setSubtotal] = useState("")
  const [targetType, setTargetType] = useState<TargetType>("NONE")
  const [categoryId, setCategoryId] = useState("")
  const [productId, setProductId] = useState("")
  const [message, setMessage] = useState("")

  const calculate = useCalculateDiscount()

  const { data: categoriesData } = useCategoriesForSelect()
  const { data: productsData } = useProducts()

  const categories = categoriesData?.data ?? []
  const products = normalizeProducts(productsData)

  const result = calculate.data

  function handleTargetTypeChange(value: TargetType) {
    setTargetType(value)
    setCategoryId("")
    setProductId("")
    setMessage("")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    const validationResult = calculateDiscountSchema.safeParse({
      discountId,
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

    calculate.mutate(calculateDiscountValuesToPayload(validationResult.data))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:discounts.calculateTitle")}
            </h1>

            <Calculator className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.calculateSubtitle")}
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
        >
          <div>
            <h2 className="text-xl font-bold text-[var(--erp-text)]">
              {t("pages:discounts.calculationData")}
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("pages:discounts.calculationHint")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("common:discountId")}</label>

              <input
                type="number"
                value={discountId}
                onChange={(event) => setDiscountId(event.target.value)}
                placeholder={t("common:exampleId")}
                className={inputClass}
              />
            </div>

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
          </div>

          <div>
            <label className={labelClass}>{t("pages:discounts.target")}</label>

            <select
              value={targetType}
              onChange={(event) =>
                handleTargetTypeChange(event.target.value as TargetType)
              }
              className={selectClass}
            >
              <option value="NONE">{t("pages:discounts.noTarget")}</option>
              <option value="CATEGORY">
                {t("pages:discounts.scopedCategory")}
              </option>
              <option value="PRODUCT">
                {t("pages:discounts.scopedProduct")}
              </option>
            </select>
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
            <div>
              <label className={labelClass}>{t("common:product")}</label>

              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className={selectClass}
              >
                <option value="">{t("common:selectProduct")}</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {localizedName(product, language)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {message && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
              {message}
            </p>
          )}

          {calculate.isError && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
              {t("pages:discounts.calculateFailed")}
            </p>
          )}

          <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
            <Button type="submit" disabled={calculate.isPending}>
              {calculate.isPending
                ? t("pages:discounts.calculating")
                : t("pages:discounts.calculateButton")}
            </Button>
          </div>
        </form>

        <ResultCard result={result} isSuccess={calculate.isSuccess} />
      </section>
    </div>
  )
}

function ResultCard({
  result,
  isSuccess,
}: {
  result: unknown
  isSuccess: boolean
}) {
  const { t } = useTranslation(["common", "pages"])

  if (!isSuccess) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
          <Percent className="mb-3 size-10 text-[var(--erp-brand-solid)]" />

          <h2 className="text-lg font-bold text-[var(--erp-text)]">
            {t("pages:discounts.resultTitle")}
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--erp-muted)]">
            {t("pages:discounts.resultHintCalculate")}
          </p>
        </div>
      </section>
    )
  }

  const safeResult =
    result && typeof result === "object"
      ? (result as Record<string, unknown>)
      : {}

  const discountAmount = safeResult.discountAmount
  const finalAmount = safeResult.finalAmount

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h2 className="mb-4 text-xl font-bold text-[var(--erp-text)]">
        {t("pages:discounts.calculationResult")}
      </h2>

      <div className="space-y-3">
        <ResultRow
          label={t("common:discountValue")}
          value={
            discountAmount !== undefined
              ? formatCurrency(String(discountAmount))
              : t("common:unavailable")
          }
        />

        <ResultRow
          label={t("pages:discounts.finalAmountAfterDiscount")}
          value={
            finalAmount !== undefined
              ? formatCurrency(String(finalAmount))
              : t("common:unavailable")
          }
        />

        <details className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--erp-text)]">
            {t("pages:discounts.showTechnicalData")}
          </summary>

          <pre className="erp-scrollbar mt-3 max-h-56 overflow-auto rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-3 text-left text-xs leading-6 whitespace-pre-wrap text-[var(--erp-text)]">
            {JSON.stringify(safeResult, null, 2)}
          </pre>
        </details>
      </div>
    </section>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-start">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}
