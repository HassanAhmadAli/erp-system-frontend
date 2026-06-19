import { Link } from "react-router-dom"

import { useAuditLogs } from "@/hooks/AuditLogs/useAuditLogs"
import { cn } from "@/lib/utils"
import {
  auditChangePreview,
  formatAuditAction,
  formatAuditEntity,
  formatAuditRole,
} from "@/services/audit-log-service"
import { formatId, toEnglishDigits } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

function actionBadgeClass(action: string): string {
  const normalized = action.toUpperCase()

  if (normalized.includes("CREATE")) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
  }

  if (normalized.includes("UPDATE")) {
    return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
  }

  if (normalized.includes("DELETE")) {
    return "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300"
  }

  return "border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]"
}

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

export function AuditLogsPage() {
  const { data: logs = [], isLoading, isError } = useAuditLogs()

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header>
        <h1 className="text-3xl font-bold text-[var(--erp-text)]">
          سجل النشاطات
        </h1>

        <p className="mt-1 text-[var(--erp-muted)]">
          سجل تدقيق العمليات في النظام — اضغط على عرض التفاصيل لرؤية المعلومات
          الكاملة.
        </p>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {isLoading ? (
          <p className="text-[var(--erp-muted)]">جاري التحميل...</p>
        ) : isError ? (
          <p className="text-red-500 dark:text-red-300">
            حدث خطأ أثناء تحميل السجل
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-right text-sm">
                <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                  <tr>
                    <th className="p-3 font-medium">#</th>
                    <th className="p-3 font-medium">الإجراء</th>
                    <th className="p-3 font-medium">الكيان</th>
                    <th className="p-3 font-medium">معرّف الكيان</th>
                    <th className="p-3 font-medium">المستخدم</th>
                    <th className="p-3 font-medium">الدور</th>
                    <th className="p-3 font-medium">التغييرات</th>
                    <th className="p-3 font-medium">تاريخ التنفيذ</th>
                    <th className="p-3 font-medium">العمليات</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                    >
                      <td className="p-3 font-medium text-[var(--erp-text)]">
                        {formatId(log.id)}
                      </td>

                      <td className="p-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                            actionBadgeClass(log.action)
                          )}
                        >
                          {formatAuditAction(log.action)}
                        </span>
                      </td>

                      <td className="p-3 text-[var(--erp-text)]">
                        {formatAuditEntity(log.entity)}
                      </td>

                      <td className="p-3 text-[var(--erp-text)]">
                        {formatId(log.entityId)}
                      </td>

                      <td className="p-3 text-[var(--erp-text)]">
                        {log.user.fullName}
                      </td>

                      <td className="p-3 text-[var(--erp-muted)]">
                        {formatAuditRole(log.user.role)}
                      </td>

                      <td className="max-w-[240px] p-3">
                        <p className="truncate text-sm text-[var(--erp-muted)]">
                          {auditChangePreview(log)}
                        </p>
                      </td>

                      <td className="p-3 whitespace-nowrap text-[var(--erp-muted)]">
                        {formatAuditDate(log.performedAt)}
                      </td>

                      <td className="p-3">
                        <Link to={`/audit-logs/${log.id}`}>
                          <Button variant="outline" size="sm">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-6 text-center text-[var(--erp-muted)]"
                      >
                        لا توجد سجلات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}