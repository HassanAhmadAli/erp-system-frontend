import { ArrowRight, Truck } from "lucide-react"
import { Link } from "react-router-dom"

import { CreateSupplierForm } from "@/view/components/suppliers/create-supplier-form"

export function CreateSupplierPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              إضافة مورد جديد
            </h1>
            <Truck className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أدخل بيانات المورد الجديد ثم اضغط حفظ.
          </p>
        </div>

        <Link
          to="/suppliers"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى الموردين
        </Link>
      </header>

      <CreateSupplierForm />
    </div>
  )
}