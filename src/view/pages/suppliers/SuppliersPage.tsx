import { Plus, Truck } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"

import { SuppliersTable } from "@/view/components/suppliers/SuppliersTable"
import { Button } from "@/view/components/ui/button"

export function SuppliersPage() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:suppliers.title")}
            </h1>
            <Truck className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:suppliers.subtitle")}
          </p>
        </div>

        <Can permission={PERMISSIONS.SUPPLIER_MANAGE}>
          <Link to="/suppliers/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              {t("pages:suppliers.create")}
            </Button>
          </Link>
        </Can>
      </header>

      <SuppliersTable />
    </div>
  )
}
