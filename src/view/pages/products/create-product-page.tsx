import { useNavigate } from "react-router-dom"

import { ProductForm } from "@/view/components/products/ProductForm"

export function CreateProductPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 text-right">
      <div>
        <h1 className="text-3xl font-bold">إضافة منتج</h1>
        <p className="mt-1 text-[var(--erp-muted)]">
          أدخل بيانات المنتج ثم احفظ
        </p>
      </div>

      <ProductForm
        mode="create"
        onSuccess={() => {
          navigate("/products", { replace: true })
        }}
      />
    </div>
  )
}
