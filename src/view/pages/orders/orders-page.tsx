import { Link } from "react-router-dom"

import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders"
import type { OrderStatus } from "@/services/orders-service"

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار",
  PREPARING: "قيد التحضير",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
}

export function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders()
  const updateOrderStatus = useUpdateOrderStatus()

  function handleStatusChange(orderId: number, status: OrderStatus) {
    updateOrderStatus.mutate({
      id: orderId,
      status,
    })
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--erp-text)]">
          الطلبات
        </h1>
      </div>

      <section className="rounded-[20px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        {isLoading && (
          <p className="text-sm text-[var(--erp-muted)]">
            جاري تحميل الطلبات...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-500">
            حدث خطأ أثناء تحميل الطلبات.
          </p>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <p className="text-sm text-[var(--erp-muted)]">
            لا توجد طلبات حالياً.
          </p>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b text-[var(--erp-muted)]">
                  <th className="whitespace-nowrap py-3 pr-4">رقم الطلب</th>
                  <th className="whitespace-nowrap py-3">العميل</th>
                  <th className="whitespace-nowrap py-3">العنوان</th>
                  <th className="whitespace-nowrap py-3">النقاط المستخدمة</th>
                  <th className="whitespace-nowrap py-3">الحالة</th>
                  <th className="whitespace-nowrap py-3">تحديث الحالة</th>
                  <th className="whitespace-nowrap py-3 pl-4">التفاصيل</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-[var(--erp-nav-active-bg)]"
                  >
                    <td className="whitespace-nowrap py-4 pr-4 font-medium">
                      #{order.id}
                    </td>

                    <td className="whitespace-nowrap py-4">
                      {order.customer?.user?.fullName ?? "غير محدد"}
                    </td>

                    <td className="max-w-[240px] truncate py-4">
                      {order.deliveryAddress ?? "لا يوجد عنوان"}
                    </td>

                    <td className="whitespace-nowrap py-4">
                      {order.loyaltyPointsUsed ?? 0}
                    </td>

                    <td className="whitespace-nowrap py-4">
                      <span className="rounded-full bg-[var(--erp-nav-active-bg)] px-3 py-1 text-xs font-medium text-[var(--erp-brand-solid)]">
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap py-4">
                      <select
                        value={order.status}
                        disabled={updateOrderStatus.isPending}
                        onChange={(event) =>
                          handleStatusChange(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-3 py-2 text-sm outline-none"
                      >
                        <option value="PENDING">قيد الانتظار</option>
                        <option value="PREPARING">قيد التحضير</option>
                        <option value="READY">جاهز</option>
                        <option value="DELIVERED">تم التسليم</option>
                        <option value="CANCELLED">ملغي</option>
                      </select>
                    </td>

                    <td className="whitespace-nowrap py-4 pl-4">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-sm font-medium text-[var(--erp-brand-solid)] hover:underline"
                      >
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}