import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { PERMISSIONS } from "@/auth/permissions"
import { useDeleteStaff } from "@/hooks/Staff/useDeleteStaff"
import { useStaff } from "@/hooks/Staff/useStaff"
import { useLocale } from "@/i18n/locale-provider"
import { localized, localizedFullName } from "@/lib/localized"
import { STAFF_ROLES, type StaffRole } from "@/services/staff-service"
import { formatNumber, toEnglishDigits } from "@/utils/number-formatters"
import { Can } from "@/view/components/auth/can"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

const fieldClass =
  "rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

export function StaffTable() {
  const { t } = useTranslation(["common", "pages"])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<StaffRole | "ALL">("ALL")
  const { language } = useLocale()
  const { data, isLoading, error, isFetching } = useStaff({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    ...(roleFilter === "ALL" ? {} : { role: roleFilter }),
  })
  const deleteMutation = useDeleteStaff()
  const hasSearch = search.trim().length > 0

  useEffect(() => {
    setPage(1)
  }, [roleFilter, search])

  const staff = data?.data ?? []

  function handleDeleteStaff(id: number, name: string) {
    const shouldDelete = window.confirm(
      t("pages:staff.confirmDeleteNamed", { name })
    )

    if (!shouldDelete) return

    deleteMutation.mutate(id)
  }

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("pages:staff.staffList")}
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {data?.total != null
              ? t("common:resultCountTotal", {
                  count: formatNumber(staff.length),
                  total: formatNumber(data.total),
                })
              : t("common:resultCount", {
                  count: formatNumber(staff.length),
                })}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(toEnglishDigits(event.target.value))}
            placeholder={t("pages:staff.searchPlaceholder")}
            className={`${fieldClass} w-full bg-[var(--erp-bg)] px-4 py-2.5 placeholder:text-[var(--erp-muted)] sm:w-64`}
          />

          <label className="flex items-center gap-2 text-sm text-[var(--erp-muted)]">
            <span className="shrink-0">{t("common:filterByRole")}</span>
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as StaffRole | "ALL")
              }
              className={fieldClass}
            >
              <option value="ALL">{t("common:all")}</option>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`, { ns: "common" })}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-[var(--erp-muted)]">{t("common:loading")}</p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {t("pages:staff.loadListFailed")}
        </p>
      )}

      {!isLoading && !error && staff.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <p className="text-sm text-[var(--erp-muted)]">
            {hasSearch ? t("pages:staff.noMatching") : t("pages:staff.noStaff")}
          </p>

          {!hasSearch && (
            <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
              <Link
                to="/staff/create"
                className="mt-4 inline-flex rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:!text-[#24114f]"
              >
                {t("pages:staff.addFirstStaff")}
              </Link>
            </Can>
          )}
        </div>
      )}

      {!isLoading && !error && staff.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full min-w-[720px] table-fixed text-start text-sm">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[18%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">{t("common:name")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:email")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:phone")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:role")}</th>
                  <th className="px-3 py-3 font-medium">
                    {t("pages:staff.jobTitle")}
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    {t("common:actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      <span className="block truncate">
                        {localizedFullName(member, language)}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">{member.email}</span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">
                        {member.phoneNumber}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">
                        {t(`roles.${member.role}`, { ns: "common" })}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">
                        {localized(
                          member.jobTitle,
                          member.jobTitleAr,
                          language
                        ) || t("common:notAvailable")}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <Link to={`/staff/${member.id}`}>
                          <Button variant="outline" size="xs">
                            {t("common:view")}
                          </Button>
                        </Link>

                        <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
                          <Link to={`/staff/${member.id}/edit`}>
                            <Button variant="outline" size="xs">
                              {t("common:edit")}
                            </Button>
                          </Link>

                          <Can permission={PERMISSIONS.ACCOUNT_DELETE}>
                            <Button
                              variant="destructive"
                              size="xs"
                              onClick={() =>
                                handleDeleteStaff(
                                  member.id,
                                  localizedFullName(member, language)
                                )
                              }
                              disabled={deleteMutation.isPending}
                            >
                              {t("common:delete")}
                            </Button>
                          </Can>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <PaginationControls
              page={page}
              isFinalPage={data?.isFinalPage ?? true}
              isLoading={isFetching}
              total={data?.total}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          </div>
        </>
      )}
    </section>
  )
}
