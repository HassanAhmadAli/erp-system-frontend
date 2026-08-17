import { useState } from "react"
import { ClipboardList } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useOrders } from "@/hooks/useOrders"
import { formatNumber } from "@/utils/number-formatters"
import { OrdersTable } from "@/view/components/orders/orders-table"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

export function OrdersPage() {
  const { t } = useTranslation(["common", "pages"])
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useOrders({
    page,
    limit: PAGE_SIZE,
  })

  const orders = data?.data ?? []

  return (
    <main className="space-y-6 text-start text-[var(--erp-text)]">
      <header>
        <div className="flex items-center justify-end gap-2">
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {t("pages:orders.title")}
          </h1>

          <ClipboardList className="size-7 text-[var(--erp-brand-solid)]" />
        </div>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          {t("pages:orders.subtitle")}
        </p>
      </header>

      <OrdersTable orders={orders} isLoading={isLoading} isError={isError} />

      {!isLoading && !isError && (
        <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)]">
          <p className="mb-3 text-sm text-[var(--erp-muted)]">
            {t("common:resultCount", {
              count: formatNumber(orders.length),
            })}
            {data?.total != null
              ? ` ${t("common:grandTotalSuffix", {
                  count: formatNumber(data.total),
                })}`
              : ""}
          </p>

          <PaginationControls
            page={page}
            isFinalPage={data?.isFinalPage ?? true}
            isLoading={isFetching}
            total={data?.total}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
        </div>
      )}
    </main>
  )
}
