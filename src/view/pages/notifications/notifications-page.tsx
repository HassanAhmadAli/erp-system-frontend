import {
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useMyNotifications,
} from "@/hooks/Notifications/useNotifications"
import { Button } from "@/view/components/ui/button"

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError } = useMyNotifications()
  const markRead = useMarkNotificationRead()
  const markUnread = useMarkNotificationUnread()

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        <p className="text-[var(--erp-muted)]">إشعاراتك الشخصية</p>
      </header>

      {isLoading ? (
        <p>جاري التحميل...</p>
      ) : isError ? (
        <p className="text-red-500">حدث خطأ أثناء تحميل الإشعارات</p>
      ) : notifications.length === 0 ? (
        <p className="text-[var(--erp-muted)]">لا توجد إشعارات</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-4 ${
                notification.isRead
                  ? "opacity-70"
                  : "bg-[var(--erp-nav-active-bg)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-right">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="mt-1 text-sm text-[var(--erp-muted)]">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-[var(--erp-muted)]">
                    {new Date(notification.createdAt).toLocaleString("ar-SY")}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {notification.isRead ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={markUnread.isPending}
                      onClick={() => markUnread.mutate(notification.id)}
                    >
                      غير مقروء
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(notification.id)}
                    >
                      مقروء
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
