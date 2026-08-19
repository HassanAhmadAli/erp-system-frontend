import type { ReactNode } from "react"
import {
  ArrowRight,
  Briefcase,
  CreditCard,
  IdCard,
  Mail,
  Phone,
  User,
  UserCog,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useParams } from "react-router-dom"

import { PERMISSIONS } from "@/auth/permissions"
import { useDeleteStaff } from "@/hooks/Staff/useDeleteStaff"
import { useStaffById } from "@/hooks/Staff/useStaffById"
import { useLocale } from "@/i18n/locale-provider"
import { localized, localizedFullName } from "@/lib/localized"
import { formatId } from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"
import { Can } from "@/view/components/auth/can"
import { Button } from "@/view/components/ui/button"

export function StaffDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const navigate = useNavigate()
  const { id } = useParams()
  const staffId = Number(id)
  const deleteMutation = useDeleteStaff()

  const {
    data: staff,
    isLoading,
    isError,
  } = useStaffById(isValidId(staffId) ? staffId : null)

  if (!isValidId(staffId)) {
    return <ErrorMessage message={t("pages:staff.invalidStaffId")} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-[var(--erp-muted)]">
          {t("pages:staff.loadingStaff")}
        </p>
      </div>
    )
  }

  if (isError || !staff) {
    return <ErrorMessage message={t("pages:staff.loadFailed")} />
  }

  function handleDelete() {
    const shouldDelete = window.confirm(
      t("pages:staff.confirmDeleteNamed", {
        name: localizedFullName(staff, language),
      })
    )

    if (!shouldDelete) return

    deleteMutation.mutate(staffId, {
      onSuccess: () => {
        navigate("/staff")
      },
    })
  }

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {localizedFullName(staff, language)}
            </h1>
            <UserCog className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-2 text-[var(--erp-muted)]">
            {t("pages:staff.detailsSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
            <Link to={`/staff/${staffId}/edit`}>
              <Button>{t("pages:staff.editStaff")}</Button>
            </Link>

            <Can permission={PERMISSIONS.ACCOUNT_DELETE}>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? t("common:deleting")
                  : t("common:deleteAccount")}
              </Button>
            </Can>
          </Can>

          <Link
            to="/staff"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            {t("pages:staff.backToStaff")}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label={t("common:staffId")}
          value={formatId(staff.id)}
          icon={<IdCard className="size-5" />}
        />

        <SummaryCard
          label={t("common:role")}
          value={t(`roles.${staff.role}`, { ns: "common" })}
          icon={<UserCog className="size-5" />}
        />

        <SummaryCard
          label={t("pages:staff.jobTitle")}
          value={
            localized(staff.jobTitle, staff.jobTitleAr, language) ||
            t("common:notAvailable")
          }
          icon={<Briefcase className="size-5" />}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 className="mb-4 text-xl font-semibold text-[var(--erp-text)]">
          {t("pages:staff.staffInfo")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label={t("common:fullName")}
            value={localizedFullName(staff, language)}
            icon={<User className="size-4" />}
          />

          <InfoRow
            label={t("common:phoneNumber")}
            value={staff.phoneNumber}
            icon={<Phone className="size-4" />}
          />

          <InfoRow
            label={t("common:email")}
            value={staff.email}
            icon={<Mail className="size-4" />}
          />

          <InfoRow
            label={t("common:nationalId")}
            value={staff.nationalId || t("common:notAvailable")}
            icon={<CreditCard className="size-4" />}
          />
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-between">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>

      <p className="mt-3 text-2xl font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-[var(--erp-text)]">
      <div className="mb-1 flex items-center justify-end gap-2 text-sm text-[var(--erp-muted)]">
        <span>{label}</span>
        {icon}
      </div>

      <p className="font-medium text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/staff"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        {t("pages:staff.backToStaff")}
      </Link>
    </div>
  )
}
