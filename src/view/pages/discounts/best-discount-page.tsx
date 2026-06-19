import { type FormEvent, useState } from "react"
import { ArrowRight, BadgePercent, Percent } from "lucide-react"
import { Link } from "react-router-dom"

import { useBestDiscount } from "@/hooks/use-discounts"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"
import { normalizeProducts } from "@/services/product-service"
import type { DiscountScope, DiscountType } from "@/services/discount-service"
import { formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

type TargetType = "GLOBAL" | "CATEGORY" | "PRODUCT"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const selectClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

function getDiscountTypeLabel(type: DiscountType) {
  return type === "PERCENTAGE" ? "نسبة مئوية" : "مبلغ ثابت"
}

function getDiscountScopeLabel(scope: DiscountScope) {
  const labels: Record<DiscountScope, string> = {
    GLOBAL: "عام",
    CATEGORY: "تصنيف",
    PRODUCT: "منتج",
    CUSTOMER: "عميل",
  }

  return labels[scope]
}

function formatDiscountValue(type: DiscountType, value: string) {
  const formattedValue = formatNumber(value)

  return type === "PERCENTAGE" ? `${formattedValue}%` : `${formattedValue} SYP`
}

export function BestDiscountPage() {
  const [subtotal, setSubtotal] = useState("")
  const [targetType, setTargetType] = useState<TargetType>("GLOBAL")
  const [categoryId, setCategoryId] = useState("")
  const [productId, setProductId] = useState("")
  const [message, setMessage] = useState("")

  const bestDiscount = useBestDiscount()

  const { data: categoriesData } = useCategoriesForSelect()
  const { data: productsData } = useProducts()

  const categories = categoriesData?.data ?? []
  const products = normalizeProducts(productsData)

  const result = bestDiscount.data

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    const subtotalValue = Number(subtotal)

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

    bestDiscount.mutate({
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
              أفضل خصم متاح
            </h1>
            <BadgePercent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            ابحث عن أفضل خصم يمكن تطبيقه على فاتورة معينة.
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

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
        >
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

          <div>
            <label className={labelClass}>نطاق البحث</label>
            <select
              value={targetType}
              onChange={(event) => {
                setTargetType(event.target.value as TargetType)
                setCategoryId("")
                setProductId("")
              }}
              className={selectClass}
            >
              <option value="GLOBAL">عام</option>
              <option value="CATEGORY">حسب التصنيف</option>
              <option value="PRODUCT">حسب المنتج</option>
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

          {bestDiscount.isError && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
              فشل جلب أفضل خصم
            </p>
          )}

          <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
            <Button type="submit" disabled={bestDiscount.isPending}>
              {bestDiscount.isPending ? "جاري البحث..." : "ابحث عن أفضل خصم"}
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
  result:
    | {
        id: number
        name: string
        type: DiscountType
        value: string
        scope: DiscountScope
      }
    | null
    | undefined
  isSuccess: boolean
}) {
  if (!isSuccess) {
    return (
      <section className="rounded-3xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
          <Percent className="mb-3 size-10 text-[var(--erp-brand-solid)]" />
          <h2 className="text-lg font-bold text-[var(--erp-text)]">النتيجة</h2>
          <p className="mt-2 text-sm text-[var(--erp-muted)]">
            أدخل بيانات الفاتورة واضغط ابحث عن أفضل خصم لعرض النتيجة هنا.
          </p>
        </div>
      </section>
    )
  }

  if (!result) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-center text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <Percent className="mx-auto mb-3 size-10 text-[var(--erp-muted)]" />

        <h2 className="text-lg font-bold text-[var(--erp-text)]">لا يوجد خصم</h2>

        <p className="mt-2 text-sm text-[var(--erp-muted)]">
          لا يوجد خصم مناسب لهذه الفاتورة.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h2 className="mb-4 text-xl font-bold text-[var(--erp-text)]">
        أفضل خصم
      </h2>

      <div className="space-y-3">
        <ResultRow label="الاسم" value={result.name} />

        <ResultRow label="النوع" value={getDiscountTypeLabel(result.type)} />

        <ResultRow
          label="القيمة"
          value={formatDiscountValue(result.type, result.value)}
        />

        <ResultRow label="النطاق" value={getDiscountScopeLabel(result.scope)} />

        <Link to={`/discounts/${result.id}`}>
          <Button variant="outline" className="mt-2 w-full">
            عرض تفاصيل الخصم
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