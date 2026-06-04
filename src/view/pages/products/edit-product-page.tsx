import { useNavigate, useParams } from "react-router-dom"

import { ProductForm } from "@/view/components/products/ProductForm"
import { useProductById } from "@/hooks/Products/useProductById"

export function EditProductPage() {
  const { id } = useParams()
  const productId = id ? Number(id) : null

  const navigate = useNavigate()
  const { data, isLoading, error } = useProductById(productId)

  if (isLoading) return <p className="text-center">جاري التحميل...</p>
  if (!data || error)
    return (
      <p className="rounded-xl bg-red-100 p-3 text-right text-red-700">
        حدث خطأ أثناء تحميل المنتج
      </p>
    )

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold">تعديل المنتج</h1>
        <p className="mt-1 text-[var(--erp-muted)]">
          قم بتحديث البيانات ثم احفظ
        </p>
      </div>

      <ProductForm
        mode="edit"
        productId={data.id}
        initialValues={data}
        onSuccess={() => {
          navigate(`/products/${data.id}`, { replace: true })
        }}
      />
    </div>
  )
}
