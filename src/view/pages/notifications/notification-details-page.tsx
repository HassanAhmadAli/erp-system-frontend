import { ArrowRight, Bell, History } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { formatShortDateTime } from "@/utils/date-formatters"
import { toEnglishDigits } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

type NotificationDetailsSource = "inbox" | "history"

type NotificationDetailsState = {
  title?: string
  body?: string
  targetLabel?: string
  senderName?: string
  recipientCount?: number
  sentAt?: string
  isRead?: boolean
  source?: NotificationDetailsSource
}

function isNotificationDetailsSource(
  source?: string
): source is NotificationDetailsSource {
  return source === "inbox" || source === "history"
}

function DetailItem({
  label,
  value,
  ltr = false,
}: {
  label: string
  value?: string
  ltr?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className={`mt-2 font-semibold text-[var(--erp-text)] ${
          ltr ? "text-left" : "text-start"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  )
}

export function NotificationDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { source, id } = useParams()
  const location = useLocation()

  const notification = location.state as NotificationDetailsState | null

  const normalizedSource: NotificationDetailsSource =
    isNotificationDetailsSource(source)
      ? source
      : (notification?.source ?? "inbox")

  const isHistory = normalizedSource === "history"
  const recordId = id ? toEnglishDigits(id) : "-"

  if (!notification) {
    return (
      <main className="space-y-6">
        <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowRight className="size-4" />
            {t("back")}
          </Button>

          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <Bell className="size-12 text-[var(--erp-muted)]" />

            <h1 className="mt-4 text-xl font-bold text-[var(--erp-text)]">
              {t("notifications.cannotViewDirectly", { ns: "pages" })}
            </h1>

            <p className="mt-2 max-w-md text-sm text-[var(--erp-muted)]">
              {t("notifications.openFromTableHint", { ns: "pages" })}
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-start">
            <div className="flex items-center gap-2">
              {isHistory ? (
                <History className="size-6 text-[var(--erp-accent)]" />
              ) : (
                <Bell className="size-6 text-[var(--erp-accent)]" />
              )}

              <h1 className="text-2xl font-bold text-[var(--erp-text)]">
                {t("notifications.details", { ns: "pages" })}
              </h1>
            </div>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("logId")}:{" "}
              <span dir="ltr" className="inline-block text-left">
                #{recordId}
              </span>
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowRight className="size-4" />
            {t("back")}
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
            <p className="text-sm text-[var(--erp-muted)]">{t("title")}</p>

            <h2 className="mt-2 text-xl font-bold text-[var(--erp-text)]">
              {toEnglishDigits(notification.title ?? "-")}
            </h2>
          </div>

          <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
            <p className="text-sm text-[var(--erp-muted)]">
              {t("notifications.notificationBody", { ns: "pages" })}
            </p>

            <p className="mt-2 leading-relaxed whitespace-pre-wrap text-[var(--erp-text)]/90">
              {toEnglishDigits(notification.body ?? "-")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label={t("target")} value={notification.targetLabel} />

            <DetailItem
              label={t("sentAt")}
              value={formatShortDateTime(notification.sentAt)}
              ltr
            />

            <DetailItem
              label={t("sender")}
              value={notification.senderName ?? "-"}
            />

            {isHistory && (
              <DetailItem
                label={t("recipientCount")}
                value={toEnglishDigits(
                  String(notification.recipientCount ?? 0)
                )}
                ltr
              />
            )}

            {!isHistory && (
              <DetailItem
                label={t("readStatus")}
                value={
                  notification.isRead
                    ? t("statuses.read")
                    : t("statuses.unread")
                }
              />
            )}

            <DetailItem
              label={t("recordType")}
              value={
                isHistory
                  ? t("notifications.sendHistoryRecord", { ns: "pages" })
                  : t("notifications.inboxRecord", { ns: "pages" })
              }
            />
          </div>
        </div>
      </section>
    </main>
  )
}
