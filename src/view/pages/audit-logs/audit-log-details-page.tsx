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
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"

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
      <div className="space-y-6 p-6 text-right" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل تفاصيل السجل...</p>
      </div>
    )
  }

  if (isError || !log) {
    return <ErrorMessage message="تعذر تحميل تفاصيل السجل." />
  }

  return (
    <div className="space-y-6 p-6 text-right" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">سجل النشاط #{log.id}</h1>
          <p className="mt-2 text-[var(--erp-muted)]">
            {formatAuditAction(log.action)} —{" "}
            {new Date(log.performedAt).toLocaleString("ar-SY")}
          </p>
        </div>

        <Link
          to="/audit-logs"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
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
          value={new Date(log.performedAt).toLocaleString("ar-SY")}
          icon={<Clock className="size-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title="معلومات العملية">
          <CustomerInfoRow label="رقم السجل" value={log.id} />
          <CustomerInfoRow
            label="الإجراء"
            value={formatAuditAction(log.action)}
          />
          <CustomerInfoRow
            label="الكيان"
            value={formatAuditEntity(log.entity)}
          />
          <CustomerInfoRow label="معرّف الكيان" value={log.entityId} />
          <CustomerInfoRow
            label="تاريخ التنفيذ"
            value={new Date(log.performedAt).toLocaleString("ar-SY")}
          />
        </CustomerInfoCard>

        <CustomerInfoCard title="معلومات المستخدم">
          <CustomerInfoRow label="اسم المستخدم" value={log.user.fullName} />
          <CustomerInfoRow label="رقم المستخدم" value={log.userId} />
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
  return `${formatAuditEntity(log.entity)} #${log.entityId}`
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[var(--erp-brand)]">{icon}</span>
        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>
      <p className="mt-3 text-lg font-bold">{value}</p>
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
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {empty ? (
        <p className="text-sm text-[var(--erp-muted)]">لا يوجد</p>
      ) : (
        <pre className="max-h-80 overflow-auto rounded-2xl border bg-slate-50 p-4 text-left text-xs leading-6 whitespace-pre-wrap">
          {content}
        </pre>
      )}
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 p-6 text-right" dir="rtl">
      <p className="text-red-500">{message}</p>
      <Link
        to="/audit-logs"
        className="inline-flex rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
      >
        العودة إلى السجل
      </Link>
    </div>
  )
}
