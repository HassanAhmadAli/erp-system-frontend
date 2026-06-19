import { FileUp, PackagePlus } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { ProductsTable } from "@/view/components/products/products-table"
import { Button } from "@/view/components/ui/button"

export function ProductsPage() {
  const navigate = useNavigate()

  return (
    <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            المنتجات
          </h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إدارة المنتجات وتحديث المخزون
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() => navigate("/products/import")}
          >
            <FileUp className="size-4" />
            استيراد CSV
          </Button>

          <Button
            type="button"
            className="w-full gap-2 sm:w-auto"
            onClick={() => navigate("/products/create")}
          >
            <PackagePlus className="size-4" />
            إضافة منتج
          </Button>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)] sm:p-5">
        <ProductsTable />
      </section>
    </main>
  )
}