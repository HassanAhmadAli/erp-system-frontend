import { useState } from "react"
import { Link } from "react-router-dom"

import { useCalculateDiscount } from "@/hooks/use-discounts"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"
import { normalizeProducts } from "@/services/product-service"
import { Button } from "@/view/components/ui/button"

type TargetType = "NONE" | "CATEGORY" | "PRODUCT"

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    const discountIdValue = Number(discountId)
    const subtotalValue = Number(subtotal)

    if (!Number.isFinite(discountIdValue) || discountIdValue <= 0) {
      setMessage("يرجى إدخال معرف خصم صحيح")
      return
    }

    if (!Number.isFinite(subtotalValue) || subtotalValue <= 0) {
      setMessage("يرجى إدخال قيمة إجمالي صحيحة")
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
    <div className="mx-auto max-w-3xl space-y-6 p-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">حساب قيمة الخصم</h1>
        <Link to="/discounts">
          <Button variant="outline">العودة للخصومات</Button>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border bg-white p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              معرف الخصم (Discount ID)
            </label>
            <input
              type="number"
              value={discountId}
              onChange={(e) => setDiscountId(e.target.value)}
              placeholder="1"
              className="w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-right"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              إجمالي الفاتورة (Subtotal)
            </label>
            <input
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-right"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            الهدف (اختياري)
          </label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as TargetType)}
            className="w-full rounded-xl border bg-slate-50 px-4 py-2.5"
          >
            <option value="NONE">بدون (خصم عام)</option>
            <option value="CATEGORY">تصنيف محدد</option>
            <option value="PRODUCT">منتج محدد</option>
          </select>
        </div>

        {targetType === "CATEGORY" && (
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              التصنيف
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border bg-slate-50 px-4 py-2.5"
            >
              <option value="">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === "PRODUCT" && (
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              المنتج
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-xl border bg-slate-50 px-4 py-2.5"
            >
              <option value="">اختر المنتج</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {message && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {message}
          </p>
        )}

        <Button type="submit" disabled={calculate.isPending}>
          {calculate.isPending ? "جاري الحساب..." : "احسب الخصم"}
        </Button>
      </form>

      {calculate.isError && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          فشل حساب قيمة الخصم
        </p>
      )}

      {calculate.isSuccess && result && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">النتيجة</h2>
          <div className="space-y-2">
            {result.discountAmount !== undefined && (
              <p>
                <span className="text-[var(--erp-muted)]">قيمة الخصم:</span>{" "}
                {String(result.discountAmount)}
              </p>
            )}
            {result.finalAmount !== undefined && (
              <p>
                <span className="text-[var(--erp-muted)]">
                  الإجمالي بعد الخصم:
                </span>{" "}
                {String(result.finalAmount)}
              </p>
            )}
            <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-slate-50 p-3 text-left text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
