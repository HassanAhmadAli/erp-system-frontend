import { Link } from "react-router-dom"

import { useAuditLogs } from "@/hooks/AuditLogs/useAuditLogs"
import {
  auditChangePreview,
  formatAuditAction,
  formatAuditEntity,
  formatAuditRole,
} from "@/services/audit-log-service"
import { Button } from "@/view/components/ui/button"

function actionBadgeClass(action: string): string {
  const normalized = action.toUpperCase()

  if (normalized.includes("CREATE")) {
    return "bg-green-100 text-green-700"
  }
  if (normalized.includes("UPDATE")) {
    return "bg-blue-100 text-blue-700"
  }
  if (normalized.includes("DELETE")) {
    return "bg-red-100 text-red-700"
  }

  return "bg-slate-100 text-slate-700"
}

export function AuditLogsPage() {
  const { data: logs = [], isLoading, isError } = useAuditLogs()

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold">سجل النشاطات</h1>
        <p className="text-[var(--erp-muted)]">
          سجل تدقيق العمليات في النظام — اضغط على عرض التفاصيل لرؤية المعلومات
          الكاملة
        </p>
      </header>

      {isLoading ? (
        <p>جاري التحميل...</p>
      ) : isError ? (
        <p className="text-red-500">حدث خطأ أثناء تحميل السجل</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-right">#</th>
                <th className="p-3 text-right">الإجراء</th>
                <th className="p-3 text-right">الكيان</th>
                <th className="p-3 text-right">معرّف الكيان</th>
                <th className="p-3 text-right">المستخدم</th>
                <th className="p-3 text-right">الدور</th>
                <th className="p-3 text-right">التغييرات</th>
                <th className="p-3 text-right">تاريخ التنفيذ</th>
                <th className="p-3 text-right">العمليات</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3">{log.id}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${actionBadgeClass(log.action)}`}
                    >
                      {formatAuditAction(log.action)}
                    </span>
                  </td>
                  <td className="p-3">{formatAuditEntity(log.entity)}</td>
                  <td className="p-3">{log.entityId}</td>
                  <td className="p-3">{log.user.fullName}</td>
                  <td className="p-3">{formatAuditRole(log.user.role)}</td>
                  <td className="max-w-[240px] p-3">
                    <p className="truncate text-sm text-[var(--erp-muted)]">
                      {auditChangePreview(log)}
                    </p>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(log.performedAt).toLocaleString("ar-SY")}
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
                  <td colSpan={9} className="p-6 text-center">
                    لا توجد سجلات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
