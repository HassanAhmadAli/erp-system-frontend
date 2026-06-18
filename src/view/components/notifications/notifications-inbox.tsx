import { Bell, Loader2 } from "lucide-react"

import {
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useMyNotifications,
} from "@/hooks/Notifications/useNotifications"
import { formatInboxTargetLabel } from "@/view/components/notifications/notification-target-labels"
import { Button } from "@/view/components/ui/button"

type NotificationsInboxProps = {
  unreadOnly?: boolean
}

export function NotificationsInbox({
  unreadOnly = false,
}: NotificationsInboxProps) {
  const { data, isLoading, isError } = useMyNotifications({ unreadOnly })
  const markRead = useMarkNotificationRead()
  const markUnread = useMarkNotificationUnread()

  const notifications = data?.items ?? []

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--erp-accent)]" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">حدث خطأ أثناء تحميل الإشعارات.</p>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
        <Bell className="h-12 w-12 text-[var(--erp-muted)]" />
        <div>
          <h3 className="text-lg font-semibold text-[var(--erp-text)]">
            {unreadOnly ? "لا توجد إشعارات غير مقروءة" : "لا توجد إشعارات"}
          </h3>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            ستظهر الإشعارات المرسلة إليك هنا.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <article
          key={notification.recipientId}
          className={`rounded-2xl border p-4 ${
            notification.isRead
              ? "border-[var(--erp-border)] bg-[color-mix(in_srgb,var(--erp-card)_96%,var(--erp-text))]"
              : "border-[var(--erp-accent)]/15 bg-[color-mix(in_srgb,var(--erp-accent)_6%,var(--erp-card))]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <h3 className="font-semibold text-[var(--erp-text)]">
                  {notification.title}
                </h3>
                <span className="rounded-full bg-[var(--erp-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--erp-accent)]">
                  {formatInboxTargetLabel(
                    notification.targetType,
                    notification.targetRole
                  )}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[var(--erp-text)]/85">
                {notification.body}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-xs text-[var(--erp-text)]/65">
                <span>
                  {new Date(notification.sentAt).toLocaleString("ar-SY")}
                </span>
                {notification.sender && (
                  <span>من: {notification.sender.fullName}</span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              {notification.isRead ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={markUnread.isPending}
                  onClick={() => markUnread.mutate(notification.recipientId)}
                >
                  غير مقروء
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(notification.recipientId)}
                >
                  مقروء
                </Button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
