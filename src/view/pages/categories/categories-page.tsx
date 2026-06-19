import { Link } from "react-router-dom"
import { FolderOpen, Plus } from "lucide-react"

import { CategoriesTable } from "@/view/components/categories/CategoriesTable"
import { Button } from "@/view/components/ui/button"

export function CategoriesPage() {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              التصنيفات
            </h1>

            <FolderOpen className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إدارة تصنيفات المنتجات وربطها بالمخزون.
          </p>
        </div>

        <Link to="/categories/create">
          <Button className="gap-2">
            <Plus className="size-4" />
            إضافة تصنيف
          </Button>
        </Link>
      </header>

      <CategoriesTable />
    </div>
  )
}
