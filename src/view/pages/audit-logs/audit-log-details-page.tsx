import type { ReactNode } from "react"
import { ArrowRight, Clock, FileText, Monitor, User } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuditLogById } from "@/hooks/AuditLogs/useAuditLogById"
import {
  formatAuditAction,
  formatAuditEntity,
  formatAuditRole,
  type AuditLog,
} from "@/services/audit-log-service"
import { formatId, toEnglishDigits } from "@/utils/number-formatters"
import { AuditValueCard } from "@/view/components/audit-logs/audit-value-card"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"

function formatAuditDate(value: string) {
  return toEnglishDigits(
    new Date(value).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  )
}

export function AuditLogDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const logId = Number(id)

  const {
    data: log,
    isLoading,
    isError,
  } = useAuditLogById(Number.isFinite(logId) ? logId : null)

  if (!Number.isFinite(logId)) {
    return (
      <ErrorMessage
        message={t("auditLogs.invalidLogId", { ns: "pages" })}
        backLabel={t("auditLogs.backToLogs", { ns: "pages" })}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-[var(--erp-muted)]">
          {t("auditLogs.loadingDetails", { ns: "pages" })}
        </p>
      </div>
    )
  }

  if (isError || !log) {
    return (
      <ErrorMessage
        message={t("auditLogs.loadDetailsFailed", { ns: "pages" })}
        backLabel={t("auditLogs.backToLogs", { ns: "pages" })}
      />
    )
  }

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {t("auditLogs.logTitle", { ns: "pages", id: formatId(log.id) })}
          </h1>

          <p className="mt-2 text-[var(--erp-muted)]">
            {formatAuditAction(log.action)} — {formatAuditDate(log.performedAt)}
          </p>
        </div>

        <Link
          to="/audit-logs"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("auditLogs.backToLogs", { ns: "pages" })}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={t("auditLogs.action", { ns: "pages" })}
          value={formatAuditAction(log.action)}
          icon={<FileText className="size-5" />}
        />

        <SummaryCard
          label={t("username")}
          value={log.user.fullName}
          icon={<User className="size-5" />}
        />

        <SummaryCard
          label={t("auditLogs.entity", { ns: "pages" })}
          value={formatEntity(log)}
          icon={<Monitor className="size-5" />}
        />

        <SummaryCard
          label={t("auditLogs.executedAt", { ns: "pages" })}
          value={formatAuditDate(log.performedAt)}
          icon={<Clock className="size-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title={t("auditLogs.operationInfo", { ns: "pages" })}>
          <CustomerInfoRow label={t("logId")} value={formatId(log.id)} />

          <CustomerInfoRow
            label={t("auditLogs.action", { ns: "pages" })}
            value={formatAuditAction(log.action)}
          />

          <CustomerInfoRow
            label={t("auditLogs.entity", { ns: "pages" })}
            value={formatAuditEntity(log.entity)}
          />

          <CustomerInfoRow
            label={t("entityId")}
            value={formatId(log.entityId)}
          />

          <CustomerInfoRow
            label={t("auditLogs.executedAt", { ns: "pages" })}
            value={formatAuditDate(log.performedAt)}
          />
        </CustomerInfoCard>

        <CustomerInfoCard title={t("auditLogs.userInfo", { ns: "pages" })}>
          <CustomerInfoRow label={t("username")} value={log.user.fullName} />

          <CustomerInfoRow label={t("userId")} value={formatId(log.userId)} />

          <CustomerInfoRow label={t("email")} value={log.user.email} />

          <CustomerInfoRow
            label={t("role")}
            value={formatAuditRole(log.user.role)}
          />
        </CustomerInfoCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AuditValueCard title={t("previousValue")} value={log.oldValue} />

        <AuditValueCard title={t("newValue")} value={log.newValue} />
      </section>
    </div>
  )
}

function formatEntity(log: AuditLog): string {
  return `${formatAuditEntity(log.entity)} #${formatId(log.entityId)}`
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
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>

      <p className="mt-3 text-lg font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function ErrorMessage({
  message,
  backLabel,
}: {
  message: string
  backLabel: string
}) {
  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/audit-logs"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        {backLabel}
      </Link>
    </div>
  )
}
