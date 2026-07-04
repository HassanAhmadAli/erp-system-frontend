import { ArrowRight, Truck } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { EditSupplierForm } from "@/view/components/suppliers/EditSupplierForm"
import { formatId } from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"

export function EditSupplierPage() {
  const { id } = useParams()
  const supplierId = Number(id)

  if (!isValidId(supplierId)) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-red-500 dark:text-red-300">رقم المورد غير صالح.</p>

        <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى الموردين
        </Link>
      </div>
    )
  }

  return (
    <div
      className="mx-auto max-w-3xl space-y-6 text-right text-[var(--erp-text)]"
      dir="rtl"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              تعديل المورد #{formatId(supplierId)}
            </h1>
            <Truck className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات المورد ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/suppliers/${supplierId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <EditSupplierForm supplierId={supplierId} />
    </div>
  )
}
