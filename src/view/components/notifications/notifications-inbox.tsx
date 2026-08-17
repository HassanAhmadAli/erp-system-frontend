import { useEffect, useState } from "react"
import { Bell, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useMyNotifications,
} from "@/hooks/Notifications/useNotifications"
import { useLocale } from "@/i18n/locale-provider"
import { toPaginationQuery } from "@/lib/pagination"
import {
  localizedFullName,
  localizedTitle,
  localized as localizedText,
} from "@/lib/localized"
import { formatShortDateTime } from "@/utils/date-formatters"
import { formatInboxTargetLabel } from "@/view/components/notifications/notification-target-labels"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

type NotificationsInboxProps = {
  unreadOnly?: boolean
}

const PAGE_SIZE = 10

export function NotificationsInbox({
  unreadOnly = false,
}: NotificationsInboxProps) {
  const { t } = useTranslation(["common", "pages"])
  const [page, setPage] = useState(1)
  const { language } = useLocale()
  const query = toPaginationQuery({ page, limit: PAGE_SIZE })
  const { data, isLoading, isError, isFetching } = useMyNotifications({
    unreadOnly,
    ...query,
  })
  const markRead = useMarkNotificationRead()
  const markUnread = useMarkNotificationUnread()

  useEffect(() => {
    setPage(1)
  }, [unreadOnly])

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
      <p className="text-sm text-red-500">
        {t("notifications.loadInboxFailed", { ns: "pages" })}
      </p>
    )
  }

  if (notifications.length === 0 && page === 1) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
        <Bell className="h-12 w-12 text-[var(--erp-muted)]" />

        <div>
          <h3 className="text-lg font-semibold text-[var(--erp-text)]">
            {unreadOnly
              ? t("notifications.noUnread", { ns: "pages" })
              : t("notifications.noNotifications", { ns: "pages" })}
          </h3>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("notifications.inboxEmptyHint", { ns: "pages" })}
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
            <div className="min-w-0 flex-1 text-start">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <h3 className="font-semibold text-[var(--erp-text)]">
                  {localizedTitle(notification, language)}
                </h3>

                <span className="rounded-full bg-[var(--erp-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--erp-accent)]">
                  {formatInboxTargetLabel(
                    notification.targetType,
                    notification.targetRole
                  )}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-[var(--erp-text)]/85">
                {localizedText(
                  notification.body,
                  notification.bodyAr,
                  language
                )}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-3 text-xs text-[var(--erp-text)]/65">
                <span dir="ltr" className="text-left">
                  {formatShortDateTime(notification.sentAt)}
                </span>

                {notification.sender && (
                  <span>
                    {t("fromSender", {
                      name: localizedFullName(notification.sender, language),
                    })}
                  </span>
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
                  {t("statuses.unread")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(notification.recipientId)}
                >
                  {t("statuses.read")}
                </Button>
              )}
            </div>
          </div>
        </article>
      ))}

      <div className="pt-2">
        <PaginationControls
          page={page}
          isFinalPage={data?.isFinalPage ?? true}
          isLoading={isFetching}
          total={data?.total}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => current + 1)}
        />
      </div>
    </div>
  )
}
