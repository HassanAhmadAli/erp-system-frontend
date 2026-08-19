import { ArrowRight, Truck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { CreateSupplierForm } from "@/view/components/suppliers/create-supplier-form"

export function CreateSupplierPage() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:suppliers.createNew")}
            </h1>
            <Truck className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:suppliers.createSubtitle")}
          </p>
        </div>

        <Link
          to="/suppliers"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("pages:suppliers.backToSuppliers")}
        </Link>
      </header>

      <CreateSupplierForm />
    </div>
  )
}
