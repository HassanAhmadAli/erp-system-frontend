import { useState } from "react"
import { Eye, History, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useNotificationHistory } from "@/hooks/Notifications/useNotifications"
import { useLocale } from "@/i18n/locale-provider"
import { toPaginationQuery } from "@/lib/pagination"
import { localized, localizedFullName, localizedTitle } from "@/lib/localized"
import { formatShortDateTime } from "@/utils/date-formatters"
import { toEnglishDigits } from "@/utils/number-formatters"
import { formatTargetLabel } from "@/view/components/notifications/notification-target-labels"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

export function NotificationHistoryTable() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { language } = useLocale()
  const [page, setPage] = useState(1)
  const query = toPaginationQuery({ page, limit: PAGE_SIZE })
  const { data, isLoading, isError, error, isFetching } =
    useNotificationHistory(query)

  const history = data?.items ?? []

  function openDetails(item: (typeof history)[number]) {
    navigate(`/notifications/details/history/${item.id}`, {
      state: {
        title: localizedTitle(item, language),
        body: localized(item.body, item.bodyAr, language),
        targetLabel: formatTargetLabel(item.targetType, item.targetRole),
        senderName: item.sender
          ? localizedFullName(item.sender, language)
          : undefined,
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
      error instanceof Error
        ? error.message
        : t("notifications.loadHistoryFailed", { ns: "pages" })

    return (
      <p className="text-sm text-red-500">
        {message.includes("403") || message.toLowerCase().includes("forbidden")
          ? t("notifications.noPermissionHistory", { ns: "pages" })
          : t("notifications.loadHistoryFailed", { ns: "pages" })}
      </p>
    )
  }

  if (history.length === 0 && page === 1) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
        <History className="h-12 w-12 text-[var(--erp-muted)]" />

        <div>
          <h3 className="text-lg font-semibold text-[var(--erp-text)]">
            {t("notifications.noSendHistory", { ns: "pages" })}
          </h3>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("notifications.sendHistoryEmptyHint", { ns: "pages" })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-start">
          <thead>
            <tr className="border-b border-[var(--erp-border)] text-sm text-[var(--erp-muted)]">
              <th className="px-4 py-3 font-medium">{t("title")}</th>
              <th className="px-4 py-3 font-medium">{t("content")}</th>
              <th className="px-4 py-3 font-medium">{t("target")}</th>
              <th className="px-4 py-3 font-medium">{t("sender")}</th>
              <th className="px-4 py-3 font-medium">{t("recipientCount")}</th>
              <th className="px-4 py-3 font-medium">{t("sentAt")}</th>
              <th className="px-4 py-3 font-medium">{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--erp-border)] last:border-0"
              >
                <td className="px-4 py-4 text-sm font-semibold text-[var(--erp-text)]">
                  {toEnglishDigits(localizedTitle(item, language))}
                </td>

                <td className="max-w-[280px] truncate px-4 py-4 text-sm text-[var(--erp-muted)]">
                  {toEnglishDigits(localized(item.body, item.bodyAr, language))}
                </td>

                <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                  {formatTargetLabel(item.targetType, item.targetRole)}
                </td>

                <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                  {item.sender ? localizedFullName(item.sender, language) : "-"}
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
                    {t("viewDetails")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        isFinalPage={data?.isFinalPage ?? true}
        isLoading={isFetching}
        total={data?.total}
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
      />
    </div>
  )
}
