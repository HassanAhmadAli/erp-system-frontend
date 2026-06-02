import { useNavigate, useParams } from "react-router-dom"

import { ProductPhotosPanel } from "@/view/components/products/ProductPhotosPanel"

export function ProductPhotosPage() {
  const { id } = useParams()
  const productId = Number(id)
  const navigate = useNavigate()

  if (!id || Number.isNaN(productId) || productId <= 0) {
    return (
      <div className="rounded-xl bg-red-100 p-3 text-right text-red-700">
        معرف المنتج غير صالح
      </div>
    )
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">إدارة صور المنتج</h1>
        <button
          type="button"
          onClick={() => navigate(`/products/${productId}`)}
          className="rounded bg-gray-200 px-3 py-1"
        >
          رجوع للتفاصيل
        </button>
      </div>

      <p className="text-sm text-[var(--erp-muted)]">
        عرض الصور عبر API: list product photos by product id
      </p>

      <ProductPhotosPanel productId={productId} />
    </div>
  )
}
