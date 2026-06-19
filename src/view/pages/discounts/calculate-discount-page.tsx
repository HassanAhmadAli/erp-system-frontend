import { type FormEvent, useState } from "react"
import { ArrowRight, Calculator, Percent } from "lucide-react"
import { Link } from "react-router-dom"

import { useCalculateDiscount } from "@/hooks/use-discounts"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"
import { normalizeProducts } from "@/services/product-service"
import { formatCurrency } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

type TargetType = "NONE" | "CATEGORY" | "PRODUCT"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const selectClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

export function CalculateDiscountPage() {
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

    const discountIdValue = Number(discountId)
    const subtotalValue = Number(subtotal)

    if (!Number.isFinite(discountIdValue) || discountIdValue <= 0) {
      setMessage("يرجى إدخال رقم خصم صحيح")
      return
    }

    if (!Number.isFinite(subtotalValue) || subtotalValue <= 0) {
      setMessage("يرجى إدخال إجمالي فاتورة صحيح")
      return
    }

    if (targetType === "CATEGORY" && !categoryId) {
      setMessage("يرجى اختيار التصنيف")
      return
    }

    if (targetType === "PRODUCT" && !productId) {
      setMessage("يرجى اختيار المنتج")
      return
    }

    calculate.mutate({
      discountId: discountIdValue,
      subtotal: subtotalValue,
      categoryId: targetType === "CATEGORY" ? Number(categoryId) : undefined,
      productId: targetType === "PRODUCT" ? Number(productId) : undefined,
    })
  }

  return (
    <div
      className="mx-auto max-w-4xl space-y-6 text-right text-[var(--erp-text)]"
      dir="rtl"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              حساب قيمة الخصم
            </h1>

            <Calculator className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            احسب قيمة خصم محدد على فاتورة معينة قبل تطبيقه.
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
        >
          <div>
            <h2 className="text-xl font-bold text-[var(--erp-text)]">
              بيانات الحساب
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              أدخل رقم الخصم وإجمالي الفاتورة وحدد الهدف عند الحاجة.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>رقم الخصم</label>

              <input
                type="number"
                value={discountId}
                onChange={(event) => setDiscountId(event.target.value)}
                placeholder="مثال: 1"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>إجمالي الفاتورة</label>

              <input
                type="number"
                value={subtotal}
                onChange={(event) => setSubtotal(event.target.value)}
                placeholder="مثال: 50000"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>الهدف</label>

            <select
              value={targetType}
              onChange={(event) =>
                handleTargetTypeChange(event.target.value as TargetType)
              }
              className={selectClass}
            >
              <option value="NONE">بدون هدف محدد</option>
              <option value="CATEGORY">تصنيف محدد</option>
              <option value="PRODUCT">منتج محدد</option>
            </select>
          </div>

          {targetType === "CATEGORY" && (
            <div>
              <label className={labelClass}>التصنيف</label>

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={selectClass}
              >
                <option value="">اختر التصنيف</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === "PRODUCT" && (
            <div>
              <label className={labelClass}>المنتج</label>

              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className={selectClass}
              >
                <option value="">اختر المنتج</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
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
              فشل حساب قيمة الخصم
            </p>
          )}

          <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
            <Button type="submit" disabled={calculate.isPending}>
              {calculate.isPending ? "جاري الحساب..." : "احسب الخصم"}
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
  if (!isSuccess) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
          <Percent className="mb-3 size-10 text-[var(--erp-brand-solid)]" />

          <h2 className="text-lg font-bold text-[var(--erp-text)]">النتيجة</h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--erp-muted)]">
            أدخل بيانات الفاتورة واضغط على زر الحساب لعرض النتيجة هنا.
          </p>
        </div>
      </section>
    )
  }

  const safeResult =
    result && typeof result === "object" ? (result as Record<string, unknown>) : {}

  const discountAmount = safeResult.discountAmount
  const finalAmount = safeResult.finalAmount

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h2 className="mb-4 text-xl font-bold text-[var(--erp-text)]">
        نتيجة الحساب
      </h2>

      <div className="space-y-3">
        <ResultRow
          label="قيمة الخصم"
          value={
            discountAmount !== undefined
              ? formatCurrency(String(discountAmount))
              : "غير متوفر"
          }
        />

        <ResultRow
          label="الإجمالي بعد الخصم"
          value={
            finalAmount !== undefined
              ? formatCurrency(String(finalAmount))
              : "غير متوفر"
          }
        />

        <details className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
          <summary className="cursor-pointer text-sm font-medium text-[var(--erp-text)]">
            عرض البيانات التقنية
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
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-right">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}