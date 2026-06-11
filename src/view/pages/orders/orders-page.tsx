import { ClipboardList } from "lucide-react"

import { useOrders } from "@/hooks/useOrders"
import { CreateOrderForm } from "@/view/components/orders/create-order-form"
import { OrdersTable } from "@/view/components/orders/orders-table"

export function OrdersPage() {
  const ordersQuery = useOrders()

  return (
    <section className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="text-right">
          <p className="text-sm text-[var(--erp-muted)]">إدارة الطلبات</p>
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            الطلبات
          </h1>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--erp-accent)]/10 text-[var(--erp-accent)]">
          <ClipboardList className="h-6 w-6" />
        </div>
      </div>

      <CreateOrderForm />

      <OrdersTable
        orders={ordersQuery.data?.data ?? []}
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
      />
    </section>
  )
}