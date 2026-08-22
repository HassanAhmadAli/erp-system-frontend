import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { useDeleteSupplier } from "@/hooks/Suppliers/useDeleteSupplier"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { PERMISSIONS } from "@/auth/permissions"
import { useLocale } from "@/i18n/locale-provider"
import { localizedFullName } from "@/lib/localized"
import { Can } from "@/view/components/auth/can"
import { formatNumber, toEnglishDigits } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

export function SuppliersTable() {
  const { t } = useTranslation(["common", "pages"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { language } = useLocale()
  const { data, isLoading, error, isFetching } = useSuppliers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  })
  const deleteMutation = useDeleteSupplier()

  const suppliers = data?.data ?? []
  const isFinalPage = data?.isFinalPage ?? suppliers.length < PAGE_SIZE
  const hasSearch = search.trim().length > 0

  function handleSearch(value: string) {
    setSearch(toEnglishDigits(value))
    setPage(1)
  }

  function handleDeleteSupplier(id: number) {
    const shouldDelete = window.confirm(t("pages:suppliers.confirmDelete"))

    if (!shouldDelete) return

    deleteMutation.mutate(id)
  }

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("pages:suppliers.supplierList")}
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {data?.total != null
              ? t("common:resultCountTotal", {
                  count: formatNumber(suppliers.length),
                  total: formatNumber(data.total),
                })
              : t("common:resultCount", {
                  count: formatNumber(suppliers.length),
                })}
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder={t("pages:suppliers.searchPlaceholder")}
          className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20 md:max-w-sm"
        />
      </div>

      {isLoading && (
        <p className="text-sm text-[var(--erp-muted)]">{t("common:loading")}</p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {t("pages:suppliers.loadListFailed")}
        </p>
      )}

      {!isLoading && !error && suppliers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <p className="text-sm text-[var(--erp-muted)]">
            {hasSearch
              ? t("pages:suppliers.noMatching")
              : t("pages:suppliers.noSuppliers")}
          </p>

          {!hasSearch && (
            <Can permission={PERMISSIONS.SUPPLIER_MANAGE}>
              <Link
                to="/suppliers/create"
                className="mt-4 inline-flex rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:!text-[#24114f]"
              >
                {t("pages:suppliers.addFirstSupplier")}
              </Link>
            </Can>
          )}
        </div>
      )}

      {!isLoading && !error && suppliers.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full min-w-[720px] table-fixed text-start text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[17%]" />
                <col className="w-[23%]" />
                <col className="w-[20%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">{t("common:name")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:phone")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:email")}</th>
                  <th className="px-3 py-3 font-medium">
                    {t("common:address")}
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    {t("common:actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      <span className="block truncate">
                        {localizedFullName(supplier, language)}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">{supplier.phone}</span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">{supplier.email}</span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      <span className="block truncate">
                        {supplier.address || t("common:notAvailable")}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <Link to={`/suppliers/${supplier.id}`}>
                          <Button variant="outline" size="xs">
                            {t("common:view")}
                          </Button>
                        </Link>

                        <Can permission={PERMISSIONS.SUPPLIER_MANAGE}>
                          <Link to={`/suppliers/${supplier.id}/edit`}>
                            <Button variant="outline" size="xs">
                              {t("common:edit")}
                            </Button>
                          </Link>

                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {t("common:delete")}
                          </Button>
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
              isFinalPage={isFinalPage}
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
