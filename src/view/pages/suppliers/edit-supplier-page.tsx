import { ArrowRight } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { EditSupplierForm } from "@/view/components/suppliers/EditSupplierForm"

export function EditSupplierPage() {
  const { id } = useParams()
  const supplierId = Number(id)

  if (!Number.isFinite(supplierId)) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <p className="text-red-500">رقم المورد غير صالح.</p>
        <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى الموردين
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تعديل المورد</h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات المورد ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/suppliers/${supplierId}`}
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <EditSupplierForm supplierId={supplierId} />
    </div>
  )
}
