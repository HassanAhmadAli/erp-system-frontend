import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { CreateSupplierForm } from "@/view/components/suppliers/create-supplier-form"

export function CreateSupplierPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إضافة مورد جديد</h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أدخل بيانات المورد الجديد ثم اضغط حفظ.
          </p>
        </div>

        <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى الموردين
        </Link>
      </header>

      <CreateSupplierForm />
    </div>
  )
}
