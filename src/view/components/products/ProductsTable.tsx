import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { StatusBadge } from "@/view/components/common/status-badge"

import { normalizeProducts, type Product } from "@/services/product-service"
import { useDeleteProduct } from "@/hooks/useDeleteProduct"
import { useProducts } from "@/hooks/useProducts"
import { ProductsSkeleton } from "./products-skeleton"

type Status = "متوفر" | "منخفض" | "نافد"

function getProductStatus(p: Product): Status {
  const qty = p.quantityInStock ?? 0
  const min = p.minQuantity ?? 0

  if (qty <= 0) return "نافد"
  if (min > 0 && qty <= min) return "منخفض"
  return "متوفر"
}

export function ProductsTable() {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, error } = useProducts()
  const deleteMutation = useDeleteProduct()

  const products = useMemo(() => normalizeProducts(data), [data])

  return (
    <div className="space-y-4">
      {isLoading && <ProductsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-xl bg-red-100 p-3 text-center text-sm text-red-700">
          حدث خطأ أثناء تحميل المنتجات
        </p>
      )}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-2xl bg-[var(--erp-card)]">
          <table className="w-full text-right">
            <thead className="bg-[var(--erp-sidebar)]">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">السعر</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-[var(--erp-muted)]">
                      {p.barcode}
                    </div>
                  </td>
                  <td className="p-3">
                    {p.category?.name ?? p.categoryId ?? "-"}
                  </td>
                  <td className="p-3">{p.sellingPrice ?? "-"}</td>
                  <td className="p-3">
                    {p.quantityInStock ?? 0}{" "}
                    {p.minQuantity ? `/ ${p.minQuantity}` : ""}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={getProductStatus(p)} />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="rounded bg-green-600 px-3 py-1 text-white"
                      >
                        التفاصيل
                      </button>
                      <button
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td className="p-6 text-center" colSpan={6}>
                    لا يوجد منتجات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return
          deleteMutation.mutate(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
