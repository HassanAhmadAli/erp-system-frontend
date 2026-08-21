import type { ReactNode } from "react"
import { CreditCard, Globe, Mail, Phone, User, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useLocale } from "@/i18n/locale-provider"
import { localizedFullName } from "@/lib/localized"
import { Button } from "@/view/components/ui/button"

export function ProfilePage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const { data: user, isLoading, isError, refetch } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-muted)]">
        {t("pages:profile.loading")}
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-4 text-start">
        <p className="text-red-500 dark:text-red-300">
          {t("pages:profile.loadFailed")}
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          {t("common:retry")}
        </Button>
      </div>
    )
  }

  const displayName = localizedFullName(user, language) || user.email
  const roleLabel = t(`roles.${user.role}`, { ns: "common" })

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {displayName}
            </h1>
            <UserRound className="size-7 text-[var(--erp-brand-solid)]" />
          </div>
          <p className="mt-2 text-[var(--erp-muted)]">
            {t("pages:profile.detailsSubtitle")}
          </p>
        </div>

        <Link to="/profile/edit">
          <Button>{t("pages:profile.editProfile")}</Button>
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          label={t("common:role")}
          value={roleLabel}
          icon={<UserRound className="size-5" />}
        />
        <SummaryCard
          label={t("common:language")}
          value={language === "ar" ? t("common:arabic") : t("common:english")}
          icon={<Globe className="size-5" />}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 className="mb-4 text-xl font-semibold text-[var(--erp-text)]">
          {t("pages:profile.personalInfo")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label={t("common:fullName")}
            value={user.fullName || t("common:notAvailable")}
            icon={<User className="size-4" />}
          />
          <InfoRow
            label={t("common:fullNameAr")}
            value={user.fullNameAr || t("common:notAvailable")}
            icon={<User className="size-4" />}
          />
          <InfoRow
            label={t("common:email")}
            value={user.email}
            icon={<Mail className="size-4" />}
          />
          <InfoRow
            label={t("common:phoneNumber")}
            value={user.phoneNumber || t("common:notAvailable")}
            icon={<Phone className="size-4" />}
          />
          <InfoRow
            label={t("common:nationalId")}
            value={user.nationalId || t("common:notAvailable")}
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
  value: string
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
  value: string
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
