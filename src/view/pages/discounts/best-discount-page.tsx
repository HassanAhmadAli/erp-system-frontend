import { useState } from "react"
import { Link } from "react-router-dom"

import { useBestDiscount } from "@/hooks/use-discounts"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"
import { normalizeProducts } from "@/services/product-service"
import { Button } from "@/view/components/ui/button"

type TargetType = "GLOBAL" | "CATEGORY" | "PRODUCT"

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")

    const subtotalValue = Number(subtotal)
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

    bestDiscount.mutate({
      subtotal: subtotalValue,
      categoryId: targetType === "CATEGORY" ? Number(categoryId) : undefined,
      productId: targetType === "PRODUCT" ? Number(productId) : undefined,
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 text-right">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">أفضل خصم متاح</h1>
        <Link to="/discounts">
          <Button variant="outline">العودة للخصومات</Button>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border bg-white p-6"
      >
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

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            النطاق
          </label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as TargetType)}
            className="w-full rounded-xl border bg-slate-50 px-4 py-2.5"
          >
            <option value="GLOBAL">عام</option>
            <option value="CATEGORY">حسب التصنيف</option>
            <option value="PRODUCT">حسب المنتج</option>
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

        <Button type="submit" disabled={bestDiscount.isPending}>
          {bestDiscount.isPending ? "جاري البحث..." : "ابحث عن أفضل خصم"}
        </Button>
      </form>

      {bestDiscount.isError && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          فشل جلب أفضل خصم
        </p>
      )}

      {bestDiscount.isSuccess && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-3 text-lg font-bold">النتيجة</h2>
          {result ? (
            <div className="space-y-2">
              <p>
                <span className="text-[var(--erp-muted)]">الاسم:</span>{" "}
                {result.name}
              </p>
              <p>
                <span className="text-[var(--erp-muted)]">النوع:</span>{" "}
                {result.type}
              </p>
              <p>
                <span className="text-[var(--erp-muted)]">القيمة:</span>{" "}
                {result.value}
              </p>
              <p>
                <span className="text-[var(--erp-muted)]">النطاق:</span>{" "}
                {result.scope}
              </p>
              <Link to={`/discounts/${result.id}`}>
                <Button variant="outline" className="mt-2">
                  عرض تفاصيل الخصم
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-[var(--erp-muted)]">
              لا يوجد خصم مطابق لهذه القيمة
            </p>
          )}
        </div>
      )}
    </div>
  )
}
