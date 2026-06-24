import { useState } from "react"

import { PERMISSIONS } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"
import { NotificationHistoryTable } from "@/view/components/notifications/notification-history-table"
import { NotificationsInbox } from "@/view/components/notifications/notifications-inbox"
import { SendNotificationForm } from "@/view/components/notifications/send-notification-form"
import { Button } from "@/view/components/ui/button"

type NotificationsTab = "inbox" | "send" | "history"

const tabs: { id: NotificationsTab; label: string }[] = [
  { id: "inbox", label: "صندوق الوارد" },
  { id: "send", label: "إرسال إشعار" },
  { id: "history", label: "سجل الإرسال" },
]

export function NotificationsPage() {
  const { can } = usePermissions()
  const canSend = can(PERMISSIONS.NOTIFICATIONS_SEND)
  const canViewHistory = can(PERMISSIONS.NOTIFICATIONS_VIEW_HISTORY)

  const visibleTabs = tabs.filter((tab) => {
    if (tab.id === "send") return canSend
    if (tab.id === "history") return canViewHistory
    return true
  })

  const [activeTab, setActiveTab] = useState<NotificationsTab>("inbox")
  const [unreadOnly, setUnreadOnly] = useState(false)

  const resolvedTab = visibleTabs.some((tab) => tab.id === activeTab)
    ? activeTab
    : "inbox"

  return (
    <main className="space-y-6" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold text-[var(--erp-text)]">الإشعارات</h1>
        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          إدارة الإشعارات الشخصية وإرسال الإشعارات الداخلية.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {visibleTabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={resolvedTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {resolvedTab === "inbox" && (
        <section className="space-y-4 rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--erp-text)]">
              إشعاراتي
            </h2>

            <label className="flex items-center gap-2 text-sm text-[var(--erp-muted)]">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(event) => setUnreadOnly(event.target.checked)}
              />
              عرض غير المقروء فقط
            </label>
          </div>

          <NotificationsInbox unreadOnly={unreadOnly} />
        </section>
      )}

      {resolvedTab === "send" && <SendNotificationForm />}

      {resolvedTab === "history" && (
        <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
          <h2 className="mb-5 text-lg font-semibold text-[var(--erp-text)]">
            سجل الإشعارات المرسلة
          </h2>

          <NotificationHistoryTable />
        </section>
      )}
    </main>
  )
}
