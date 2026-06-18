import { useOrders } from "@/hooks/useOrders"
import { CreateOrderForm } from "@/view/components/orders/create-order-form"
import { OrdersTable } from "@/view/components/orders/orders-table"

export function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders()

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--erp-text)]">الطلبات</h1>
      </div>

      <CreateOrderForm />

      <OrdersTable orders={orders} isLoading={isLoading} isError={isError} />
    </main>
  )
}
