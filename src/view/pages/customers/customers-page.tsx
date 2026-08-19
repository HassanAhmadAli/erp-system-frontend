import type { ComponentType } from "react"
import { useEffect, useState } from "react"
import { Eye, UserCheck, UserX, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  useCustomers,
  useUpdateCustomerStatus,
} from "@/hooks/Suppliers/useCustomers"
import {
  isCustomerStatus,
  type CustomerStatus,
} from "@/validation/customer-schema"
import { isValidId } from "@/validation/helpers"
import { CustomerStatusBadge } from "@/view/components/customers/customer-status-badge"
import { formatCurrency, formatNumber } from "@/utils/number-formatters"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

export function CustomersPage() {
  const { t } = useTranslation(["common", "pages"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusError, setStatusError] = useState("")

  const { data, isLoading, isError, isFetching } = useCustomers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  })
  const updateStatus = useUpdateCustomerStatus()

  useEffect(() => {
    setPage(1)
  }, [search])

  const customers = data?.data ?? []

  const activeCustomers = customers.filter((customer) => customer.user.isActive)
  const inactiveCustomers = customers.filter(
    (customer) => !customer.user.isActive
  )

  const totalLoyaltyPoints = customers.reduce(
    (sum, customer) => sum + customer.loyaltyPoints,
    0
  )

  function handleStatusUpdate(id: number, status: CustomerStatus) {
    setStatusError("")

    if (!isValidId(id)) {
      setStatusError(t("pages:customers.invalidCustomerId"))
      return
    }

    if (!isCustomerStatus(status)) {
      setStatusError(t("pages:customers.invalidCustomerStatus"))
      return
    }

    updateStatus.mutate({ id, status })
  }

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header>
        <h1 className="text-3xl font-bold text-[var(--erp-text)]">
          {t("pages:customers.title")}
        </h1>
        <p className="mt-1 text-[var(--erp-muted)]">
          {t("pages:customers.subtitle")}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerStatCard
          label={t("pages:customers.totalCustomers")}
          value={data?.total ?? customers.length}
          icon={Users}
        />

        <CustomerStatCard
          label={t("pages:customers.activeCustomersPage")}
          value={activeCustomers.length}
          icon={UserCheck}
        />

        <CustomerStatCard
          label={t("pages:customers.inactiveCustomersPage")}
          value={inactiveCustomers.length}
          icon={UserX}
        />

        <CustomerStatCard
          label={t("pages:customers.loyaltyPointsPage")}
          value={totalLoyaltyPoints}
          icon={UserCheck}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              {t("pages:customers.customerList")}
            </h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {data?.total != null
                ? t("common:resultCountTotal", {
                    count: formatNumber(customers.length),
                    total: formatNumber(data.total),
                  })
                : t("common:resultCount", {
                    count: formatNumber(customers.length),
                  })}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("pages:customers.searchPlaceholder")}
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2 text-start text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20 sm:w-72"
          />
        </div>

        {isLoading && (
          <p className="text-[var(--erp-muted)]">
            {t("pages:customers.loadingCustomers")}
          </p>
        )}

        {isError && (
          <p className="text-red-500 dark:text-red-300">
            {t("pages:customers.loadListFailed")}
          </p>
        )}

        {statusError && (
          <p className="mb-3 text-sm text-red-500 dark:text-red-300">
            {statusError}
          </p>
        )}

        {!isLoading && !isError && customers.length === 0 && (
          <p className="text-[var(--erp-muted)]">
            {t("pages:customers.noCustomers")}
          </p>
        )}

        {!isLoading && !isError && customers.length > 0 && (
          <>
            <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-start text-sm">
                  <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        {t("common:name")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("common:email")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("common:phone")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("common:address")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("common:status")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("pages:customers.loyaltyPoints")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("pages:customers.totalSpent")}
                      </th>
                      <th className="px-4 py-3 font-medium">
                        {t("common:actions")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => {
                      const isActive = customer.user.isActive

                      return (
                        <tr
                          key={customer.id}
                          className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                        >
                          <td className="px-4 py-3 font-medium text-[var(--erp-text)]">
                            {customer.user.fullName}
                          </td>

                          <td className="px-4 py-3 text-[var(--erp-muted)]">
                            {customer.user.email}
                          </td>

                          <td className="px-4 py-3 text-[var(--erp-muted)]">
                            {customer.user.phoneNumber}
                          </td>

                          <td className="px-4 py-3 text-[var(--erp-muted)]">
                            {customer.address ?? t("common:notAvailable")}
                          </td>

                          <td className="px-4 py-3">
                            <CustomerStatusBadge isActive={isActive} />
                          </td>

                          <td
                            dir="ltr"
                            className="px-4 py-3 font-medium text-[var(--erp-text)] tabular-nums"
                          >
                            {formatNumber(customer.loyaltyPoints)}
                          </td>

                          <td
                            dir="ltr"
                            className="px-4 py-3 font-medium text-[var(--erp-text)] tabular-nums"
                          >
                            {formatCurrency(customer.totalSpent)}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/customers/${customer.id}`}
                                className="inline-flex items-center gap-1 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-3 py-1 text-xs font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
                              >
                                <Eye className="size-3" />
                                {t("common:view")}
                              </Link>

                              <button
                                disabled={updateStatus.isPending}
                                onClick={() =>
                                  handleStatusUpdate(
                                    customer.id,
                                    isActive ? "inactive" : "active"
                                  )
                                }
                                className={
                                  isActive
                                    ? "rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                                    : "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
                                }
                              >
                                {isActive
                                  ? t("common:disable")
                                  : t("common:enable")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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

type CustomerStatCardProps = {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
}

function CustomerStatCard({ label, value, icon: Icon }: CustomerStatCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          <Icon className="size-5" />
        </div>
      </div>

      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p
        dir="ltr"
        className="mt-2 text-2xl font-bold text-[var(--erp-text)] tabular-nums"
      >
        {formatNumber(value)}
      </p>
    </div>
  )
}
