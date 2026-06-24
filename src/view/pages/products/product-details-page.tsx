import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"

import { StatusBadge } from "@/view/components/common/status-badge"
import { ProductPhotosPanel } from "@/view/components/products/ProductPhotosPanel"
import { useProductById } from "@/hooks/Products/useProductById"
import { usePermissions } from "@/hooks/usePermissions"
import { useUpdateProductStock } from "@/hooks/Products/useUpdateProductStock"

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
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.PRODUCT_MANAGE)
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
          <Can permission={PERMISSIONS.PRODUCT_MANAGE}>
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
          </Can>
        </div>
      </div>

      <section className="rounded-2xl bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.name}</h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {data.description?.trim() || "لا يوجد وصف"}
            </p>
          </div>
          {status && <StatusBadge status={status} />}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
          <h3 className="mb-3 text-lg font-bold">معلومات المنتج</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--erp-muted)]">المعرف:</span> {data.id}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الباركود:</span>{" "}
              {data.barcode || "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">رابط الصورة:</span>{" "}
              {data.imageUrl || "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">أنشئ بتاريخ:</span>{" "}
              {data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">آخر تحديث:</span>{" "}
              {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "-"}
            </p>
          </div>
        </article>

        <article className="rounded-2xl bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
          <h3 className="mb-3 text-lg font-bold">الأسعار والمخزون</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--erp-muted)]">سعر الشراء:</span>{" "}
              {data.purchasePrice ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">سعر البيع:</span>{" "}
              {data.sellingPrice ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الكمية الحالية:</span>{" "}
              {data.quantityInStock ?? 0}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الحد الأدنى:</span>{" "}
              {data.minQuantity ?? "-"}
            </p>
          </div>
        </article>

        <article className="rounded-2xl bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
          <h3 className="mb-3 text-lg font-bold">التصنيف</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--erp-muted)]">Category ID:</span>{" "}
              {data.categoryId ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الاسم:</span>{" "}
              {data.category?.name ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الوصف:</span>{" "}
              {data.category?.description || "-"}
            </p>
          </div>
        </article>

        <article className="rounded-2xl bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
          <h3 className="mb-3 text-lg font-bold">المورد</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--erp-muted)]">Supplier ID:</span>{" "}
              {data.supplierId ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الاسم:</span>{" "}
              {data.supplier?.fullName ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">الهاتف:</span>{" "}
              {data.supplier?.phone ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">البريد:</span>{" "}
              {data.supplier?.email ?? "-"}
            </p>
            <p>
              <span className="text-[var(--erp-muted)]">العنوان:</span>{" "}
              {data.supplier?.address ?? "-"}
            </p>
          </div>
        </article>
      </section>

      {canManage && (
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
      )}

      {canManage && <ProductPhotosPanel productId={data.id} />}
    </div>
  )
}
