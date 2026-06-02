import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { StatusBadge } from "@/view/components/common/status-badge"
import { ProductPhotosPanel } from "@/view/components/products/ProductPhotosPanel"
import { useProductById } from "@/hooks/useProductById"
import { useUpdateProductStock } from "@/hooks/useUpdateProductStock"

import type { Product } from "@/services/product-service"

type StockStatus = "متوفر" | "منخفض" | "نافد"

function getStockStatus(p: Product): StockStatus {
  const qty = p.quantityInStock ?? 0
  const min = p.minQuantity ?? 0
  if (qty <= 0) return "نافد"
  if (min > 0 && qty <= min) return "منخفض"
  return "متوفر"
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const productId = id ? Number(id) : null

  const navigate = useNavigate()
  const { data, isLoading, error } = useProductById(productId)
  const stockMutation = useUpdateProductStock()

  const [quantityInStock, setQuantityInStock] = useState<string>("")
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  useEffect(() => {
    if (data) {
      setQuantityInStock(
        data.quantityInStock !== undefined ? String(data.quantityInStock) : "0"
      )
    }
  }, [data])

  const status = useMemo(() => {
    if (!data) return null
    return getStockStatus(data)
  }, [data])

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!productId) return

    const qty = Number(quantityInStock)
    if (!Number.isFinite(qty) || qty < 0) {
      setMessage({ type: "error", text: "الكمية غير صالحة" })
      return
    }

    try {
      await stockMutation.mutateAsync({
        id: productId,
        data: { quantityInStock: qty },
      })
      setMessage({ type: "success", text: "تم تحديث المخزون بنجاح" })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "فشل تحديث المخزون",
      })
    }
  }

  if (isLoading) return <p className="text-center">جاري التحميل...</p>
  if (!data || error)
    return (
      <p className="rounded-xl bg-red-100 p-3 text-right text-red-700">
        حدث خطأ أثناء تحميل المنتج
      </p>
    )

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">تفاصيل المنتج</h1>
        <div className="flex gap-2">
          <button
            className="rounded bg-gray-200 px-3 py-1"
            onClick={() => navigate("/products")}
            type="button"
          >
            رجوع
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-1 text-white"
            onClick={() => navigate(`/products/${data.id}/edit`)}
            type="button"
          >
            تعديل
          </button>
          <button
            className="rounded bg-indigo-600 px-3 py-1 text-white"
            onClick={() => navigate(`/products/${data.id}/photos`)}
            type="button"
          >
            صفحة الصور
          </button>
        </div>
      </div>

      <div className="rounded-2xl border p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.name}</h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {data.barcode}
            </p>
          </div>
          {status && <StatusBadge status={status} />}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <p className="text-sm text-[var(--erp-muted)]">سعر البيع</p>
            <p className="text-lg">{data.sellingPrice ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--erp-muted)]">الكمية</p>
            <p className="text-lg">
              {data.quantityInStock ?? 0}
              {data.minQuantity ? ` (حد أدنى: ${data.minQuantity})` : ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--erp-muted)]">التصنيف</p>
            <p className="text-lg">
              {data.category?.name ?? data.categoryId ?? "-"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdateStock} className="rounded-2xl border p-6">
        <h3 className="mb-3 text-xl font-bold">تحديث مخزون المنتج</h3>
        {message && (
          <div
            className={`mb-4 rounded-xl p-3 text-center text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <label className="block space-y-2">
          <span className="block text-right text-sm text-[var(--erp-muted)]">
            الكمية في المخزون
          </span>
          <input
            type="number"
            className="w-full rounded-xl border p-3"
            value={quantityInStock}
            onChange={(e) => setQuantityInStock(e.target.value)}
            disabled={stockMutation.isPending}
          />
        </label>

        <button
          type="submit"
          disabled={stockMutation.isPending}
          className="mt-4 w-full rounded-xl bg-green-600 px-5 py-3 text-white disabled:opacity-60"
        >
          {stockMutation.isPending ? "جاري التحديث..." : "حفظ المخزون"}
        </button>
      </form>

      <ProductPhotosPanel productId={data.id} />
    </div>
  )
}
