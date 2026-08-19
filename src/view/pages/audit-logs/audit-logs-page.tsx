import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuditLogs } from "@/hooks/AuditLogs/useAuditLogs"
import { cn } from "@/lib/utils"
import {
  auditChangePreview,
  formatAuditAction,
  formatAuditEntity,
  formatAuditRole,
} from "@/services/audit-log-service"
import {
  formatId,
  formatNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

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
  const { t } = useTranslation(["common", "pages"])
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useAuditLogs({
    page,
    limit: PAGE_SIZE,
  })

  const logs = data?.data ?? []

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header>
        <h1 className="text-3xl font-bold text-[var(--erp-text)]">
          {t("auditLogs.title", { ns: "pages" })}
        </h1>

        <p className="mt-1 text-[var(--erp-muted)]">
          {t("auditLogs.subtitle", { ns: "pages" })}
        </p>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {isLoading ? (
          <p className="text-[var(--erp-muted)]">{t("loading")}</p>
        ) : isError ? (
          <p className="text-red-500 dark:text-red-300">
            {t("auditLogs.loadFailed", { ns: "pages" })}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--erp-muted)]">
              {t("resultCountTotal", {
                count: formatNumber(logs.length),
                total:
                  data?.total != null
                    ? formatNumber(data.total)
                    : formatNumber(logs.length),
              })}
            </p>

            <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-start text-sm">
                  <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                    <tr>
                      <th className="p-3 font-medium">#</th>
                      <th className="p-3 font-medium">
                        {t("auditLogs.action", { ns: "pages" })}
                      </th>
                      <th className="p-3 font-medium">
                        {t("auditLogs.entity", { ns: "pages" })}
                      </th>
                      <th className="p-3 font-medium">{t("entityId")}</th>
                      <th className="p-3 font-medium">{t("username")}</th>
                      <th className="p-3 font-medium">{t("role")}</th>
                      <th className="p-3 font-medium">{t("changes")}</th>
                      <th className="p-3 font-medium">
                        {t("auditLogs.executedAt", { ns: "pages" })}
                      </th>
                      <th className="p-3 font-medium">{t("operations")}</th>
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
                              {t("viewDetails")}
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
                          {t("auditLogs.noLogs", { ns: "pages" })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <PaginationControls
                page={page}
                isFinalPage={data?.isFinalPage ?? true}
                isLoading={isFetching}
                total={data?.total}
                onPrevious={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                onNext={() => setPage((current) => current + 1)}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
