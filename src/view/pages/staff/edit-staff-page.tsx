import { ArrowRight, UserCog } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { EditStaffForm } from "@/view/components/staff/edit-staff-form"
import { formatId } from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"

export function EditStaffPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const staffId = Number(id)

  if (!isValidId(staffId)) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-red-500 dark:text-red-300">
          {t("pages:staff.invalidStaffId")}
        </p>

        <Link
          to="/staff"
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("pages:staff.backToStaff")}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:staff.editTitle", { id: formatId(staffId) })}
            </h1>
            <UserCog className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:staff.editSubtitle")}
          </p>
        </div>

        <Link
          to={`/staff/${staffId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("common:backToDetails")}
        </Link>
      </header>

      <EditStaffForm staffId={staffId} />
    </div>
  )
}
