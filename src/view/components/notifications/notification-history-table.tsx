import { Eye, History, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useNotificationHistory } from "@/hooks/Notifications/useNotifications"
import { formatShortDateTime } from "@/utils/date-formatters"
import { toEnglishDigits } from "@/utils/number-formatters"
import { formatTargetLabel } from "@/view/components/notifications/notification-target-labels"
import { Button } from "@/view/components/ui/button"

export function NotificationHistoryTable() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useNotificationHistory()

  const history = data?.items ?? []

  function openDetails(item: (typeof history)[number]) {
    navigate(`/notifications/details/history/${item.id}`, {
      state: {
        title: item.title,
        body: item.body,
        targetLabel: formatTargetLabel(item.targetType, item.targetRole),
        senderName: item.sender?.fullName,
        recipientCount: item.recipientCount,
        sentAt: item.sentAt,
        source: "history",
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--erp-accent)]" />
      </div>
    )
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : "حدث خطأ أثناء تحميل السجل."

    return (
      <p className="text-sm text-red-500">
        {message.includes("403") || message.toLowerCase().includes("forbidden")
          ? "ليس لديك صلاحية لعرض سجل الإشعارات المرسلة."
          : "حدث خطأ أثناء تحميل سجل الإشعارات."}
      </p>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
        <History className="h-12 w-12 text-[var(--erp-muted)]" />

        <div>
          <h3 className="text-lg font-semibold text-[var(--erp-text)]">
            لا يوجد سجل إرسال
          </h3>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            ستظهر الإشعارات التي تم إرسالها من النظام هنا.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-right">
        <thead>
          <tr className="border-b border-[var(--erp-border)] text-sm text-[var(--erp-muted)]">
            <th className="px-4 py-3 font-medium">العنوان</th>
            <th className="px-4 py-3 font-medium">النص</th>
            <th className="px-4 py-3 font-medium">المستهدف</th>
            <th className="px-4 py-3 font-medium">المرسل</th>
            <th className="px-4 py-3 font-medium">عدد المستلمين</th>
            <th className="px-4 py-3 font-medium">تاريخ الإرسال</th>
            <th className="px-4 py-3 font-medium">الإجراءات</th>
          </tr>
        </thead>

        <tbody>
          {history.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--erp-border)] last:border-0"
            >
              <td className="px-4 py-4 text-sm font-semibold text-[var(--erp-text)]">
                {toEnglishDigits(item.title)}
              </td>

              <td className="max-w-[280px] truncate px-4 py-4 text-sm text-[var(--erp-muted)]">
                {toEnglishDigits(item.body)}
              </td>

              <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                {formatTargetLabel(item.targetType, item.targetRole)}
              </td>

              <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                {item.sender?.fullName ?? "-"}
              </td>

              <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                <span dir="ltr" className="inline-block text-left">
                  {toEnglishDigits(String(item.recipientCount))}
                </span>
              </td>

              <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                <span dir="ltr" className="inline-block text-left">
                  {formatShortDateTime(item.sentAt)}
                </span>
              </td>

              <td className="px-4 py-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openDetails(item)}
                >
                  <Eye className="size-4" />
                  عرض التفاصيل
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}