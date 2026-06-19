import type { ReactNode } from "react"
import { ArrowRight, Clock, FileText, Monitor, User } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { useAuditLogById } from "@/hooks/AuditLogs/useAuditLogById"
import {
  formatAuditAction,
  formatAuditEntity,
  formatAuditRole,
  formatAuditValue,
  type AuditLog,
} from "@/services/audit-log-service"
import { formatId, toEnglishDigits } from "@/utils/number-formatters"
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
  const { id } = useParams()
  const logId = Number(id)

  const {
    data: log,
    isLoading,
    isError,
  } = useAuditLogById(Number.isFinite(logId) ? logId : null)

  if (!Number.isFinite(logId)) {
    return <ErrorMessage message="رقم السجل غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل تفاصيل السجل...</p>
      </div>
    )
  }

  if (isError || !log) {
    return <ErrorMessage message="تعذر تحميل تفاصيل السجل." />
  }

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            سجل النشاط #{formatId(log.id)}
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
          العودة إلى السجل
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="الإجراء"
          value={formatAuditAction(log.action)}
          icon={<FileText className="size-5" />}
        />

        <SummaryCard
          label="المستخدم"
          value={log.user.fullName}
          icon={<User className="size-5" />}
        />

        <SummaryCard
          label="الكيان"
          value={formatEntity(log)}
          icon={<Monitor className="size-5" />}
        />

        <SummaryCard
          label="تاريخ التنفيذ"
          value={formatAuditDate(log.performedAt)}
          icon={<Clock className="size-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title="معلومات العملية">
          <CustomerInfoRow label="رقم السجل" value={formatId(log.id)} />

          <CustomerInfoRow
            label="الإجراء"
            value={formatAuditAction(log.action)}
          />

          <CustomerInfoRow
            label="الكيان"
            value={formatAuditEntity(log.entity)}
          />

          <CustomerInfoRow
            label="معرّف الكيان"
            value={formatId(log.entityId)}
          />

          <CustomerInfoRow
            label="تاريخ التنفيذ"
            value={formatAuditDate(log.performedAt)}
          />
        </CustomerInfoCard>

        <CustomerInfoCard title="معلومات المستخدم">
          <CustomerInfoRow label="اسم المستخدم" value={log.user.fullName} />

          <CustomerInfoRow label="رقم المستخدم" value={formatId(log.userId)} />

          <CustomerInfoRow label="البريد الإلكتروني" value={log.user.email} />

          <CustomerInfoRow
            label="الدور"
            value={formatAuditRole(log.user.role)}
          />
        </CustomerInfoCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <JsonCard
          title="القيمة السابقة"
          content={formatAuditValue(log.oldValue)}
          empty={!log.oldValue}
        />

        <JsonCard
          title="القيمة الجديدة"
          content={formatAuditValue(log.newValue)}
          empty={!log.newValue}
        />
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

function JsonCard({
  title,
  content,
  empty,
}: {
  title: string
  content: string
  empty?: boolean
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h2 className="mb-4 text-xl font-semibold text-[var(--erp-text)]">
        {title}
      </h2>

      {empty ? (
        <p className="text-sm text-[var(--erp-muted)]">لا يوجد</p>
      ) : (
        <pre className="erp-scrollbar max-h-80 overflow-auto rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-left text-xs leading-6 whitespace-pre-wrap text-[var(--erp-text)]">
          {content}
        </pre>
      )}
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/audit-logs"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        العودة إلى السجل
      </Link>
    </div>
  )
}