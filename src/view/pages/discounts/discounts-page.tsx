import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Percent, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  deleteDiscount,
  getDiscounts,
  toggleDiscount,
} from "@/services/discount-service"
import { useLocale } from "@/i18n/locale-provider"
import { localizedName } from "@/lib/localized"
import {
  formatDiscountValue,
  getDiscountScopeLabel,
  getDiscountTypeLabel,
} from "@/lib/discount-labels"
import { cn } from "@/lib/utils"
import { Button } from "@/view/components/ui/button"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

function statusBadgeClass(isActive: boolean) {
  return isActive
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
    : "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300"
}

export function DiscountsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("")
  const [scopeFilter, setScopeFilter] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState("")

  const limit = 10

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["discounts", page, search],
    queryFn: () =>
      getDiscounts({
        page,
        limit,
        search: search || undefined,
      }),
  })

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, scopeFilter])

  const discounts = (data?.data ?? []).filter((discount) => {
    if (typeFilter && discount.type !== typeFilter) return false
    if (scopeFilter && discount.scope !== scopeFilter) return false
    return true
  })

  async function handleDelete() {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      setActionError("")
      await deleteDiscount(deleteId)
      setDeleteId(null)
      refetch()
    } catch (err) {
      console.error(err)
      setActionError(t("pages:discounts.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      setActionError("")
      await toggleDiscount(id, !current)
      refetch()
    } catch (err) {
      console.error(err)
      setActionError(t("pages:discounts.toggleFailed"))
    }
  }

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:discounts.manageTitle")}
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.manageSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/discounts/active">
            <Button variant="outline">{t("pages:discounts.active")}</Button>
          </Link>

          <Link to="/discounts/best">
            <Button variant="outline">{t("pages:discounts.best")}</Button>
          </Link>

          <Link to="/discounts/calculate">
            <Button variant="outline">{t("pages:discounts.calculate")}</Button>
          </Link>

          <Link to="/discounts/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              {t("pages:discounts.create")}
            </Button>
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder={t("pages:discounts.searchPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
          >
            <option value="">{t("common:allTypes")}</option>
            <option value="PERCENTAGE">{t("common:percentage")}</option>
            <option value="FIXED_AMOUNT">{t("common:fixedAmount")}</option>
          </select>

          <select
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
          >
            <option value="">{t("common:allScopes")}</option>
            <option value="GLOBAL">{t("common:global")}</option>
            <option value="CATEGORY">{t("common:scopeCategoryShort")}</option>
            <option value="PRODUCT">{t("common:scopeProductShort")}</option>
          </select>
        </div>

        {actionError && (
          <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {actionError}
          </p>
        )}

        {isLoading && (
          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.loading")}
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {t("pages:discounts.loadFailed")}
          </p>
        )}

        {!isLoading && !error && discounts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
            <p className="text-sm text-[var(--erp-muted)]">
              {t("pages:discounts.noMatching")}
            </p>
          </div>
        )}

        {!isLoading && !error && discounts.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full min-w-[860px] table-fixed text-start text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[22%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">{t("common:name")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:type")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:value")}</th>
                  <th className="px-3 py-3 font-medium">{t("common:scope")}</th>
                  <th className="px-3 py-3 text-center font-medium">
                    {t("common:status")}
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    {t("common:operations")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {discounts.map((discount) => (
                  <tr
                    key={discount.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      <span className="block truncate">
                        {localizedName(discount, language)}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      {getDiscountTypeLabel(discount.type, t)}
                    </td>

                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      {formatDiscountValue(discount.type, discount.value)}
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      {getDiscountScopeLabel(discount.scope, t)}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            statusBadgeClass(discount.isActive)
                          )}
                        >
                          {discount.isActive
                            ? t("common:enabledLabel")
                            : t("common:disabledLabel")}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <Link to={`/discounts/${discount.id}`}>
                          <Button variant="outline" size="xs">
                            {t("common:view")}
                          </Button>
                        </Link>

                        <Link to={`/discounts/${discount.id}/edit`}>
                          <Button variant="outline" size="xs">
                            {t("common:edit")}
                          </Button>
                        </Link>

                        <Button
                          variant={
                            discount.isActive ? "destructive" : "success"
                          }
                          size="xs"
                          onClick={() =>
                            handleToggle(discount.id, discount.isActive)
                          }
                        >
                          {discount.isActive
                            ? t("common:disable")
                            : t("common:enable")}
                        </Button>

                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => setDeleteId(discount.id)}
                        >
                          {t("common:delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5">
          <PaginationControls
            page={page}
            isFinalPage={data?.isFinalPage ?? true}
            isLoading={isFetching}
            total={data?.total}
            onPrevious={() => setPage((currentPage) => currentPage - 1)}
            onNext={() => setPage((currentPage) => currentPage + 1)}
          />
        </div>
      </section>

      <ConfirmDialog
        open={!!deleteId}
        title={t("pages:discounts.confirmDeleteTitle")}
        description={t("pages:discounts.confirmDeleteDesc")}
        confirmLabel={t("common:delete")}
        cancelLabel={t("common:cancel")}
        isLoading={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
