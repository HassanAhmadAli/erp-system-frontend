import { Plus, Truck } from "lucide-react"
import { Link } from "react-router-dom"

import { SuppliersTable } from "@/view/components/suppliers/SuppliersTable"
import { Button } from "@/view/components/ui/button"

export function SuppliersPage() {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              الموردون
            </h1>
            <Truck className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إدارة بيانات الموردين ومعلومات التواصل الخاصة بهم.
          </p>
        </div>

        <Link to="/suppliers/create">
          <Button className="gap-2">
            <Plus className="size-4" />
            إضافة مورد
          </Button>
        </Link>
      </header>

      <SuppliersTable />
    </div>
  )
}