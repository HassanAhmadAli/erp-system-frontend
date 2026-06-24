import { useNavigate } from "react-router-dom"

import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"
import { ProductsTable } from "@/view/components/products/ProductsTable"

export function ProductsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <p className="mt-1 text-[var(--erp-muted)]">
            إدارة المنتجات وتحديث المخزون
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCT_CREATE}>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/products/import")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white"
            >
              استيراد CSV
            </button>
            <button
              onClick={() => navigate("/products/create")}
              className="rounded-xl bg-green-600 px-4 py-2 text-white"
            >
              إضافة منتج
            </button>
          </div>
        </Can>
      </div>

      <ProductsTable />
    </div>
  )
}
