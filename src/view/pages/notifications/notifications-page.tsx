import { useState } from "react"

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
  const [activeTab, setActiveTab] = useState<NotificationsTab>("inbox")
  const [unreadOnly, setUnreadOnly] = useState(false)

  return (
    <main className="space-y-6" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold text-[var(--erp-text)]">الإشعارات</h1>
        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          إدارة الإشعارات الشخصية وإرسال الإشعارات الداخلية.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "inbox" && (
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

      {activeTab === "send" && <SendNotificationForm />}

      {activeTab === "history" && (
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
