import { ClipboardList } from "lucide-react"

import { useOrders } from "@/hooks/useOrders"
import { OrdersTable } from "@/view/components/orders/orders-table"

export function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders()

  return (
    <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header>
        <div className="flex items-center justify-end gap-2">
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            الطلبات
          </h1>

          <ClipboardList className="size-7 text-[var(--erp-brand-solid)]" />
        </div>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          متابعة الطلبات القادمة من تطبيق الموبايل وتحديث حالتها.
        </p>
      </header>

      <OrdersTable orders={orders} isLoading={isLoading} isError={isError} />
    </main>
  )
}