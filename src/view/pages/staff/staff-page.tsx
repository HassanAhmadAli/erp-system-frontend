import { Plus, UserCog } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"
import { StaffTable } from "@/view/components/staff/staff-table"
import { Button } from "@/view/components/ui/button"

export function StaffPage() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:staff.managementTitle")}
            </h1>
            <UserCog className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:staff.subtitle")}
          </p>
        </div>

        <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
          <Link to="/staff/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              {t("pages:staff.create")}
            </Button>
          </Link>
        </Can>
      </header>

      <StaffTable />
    </div>
  )
}
