import { useNavigate } from "react-router-dom"
import { CheckCircle, Eye, Loader2, PackageCheck, XCircle } from "lucide-react"

import { useUpdateOrderStatus } from "@/hooks/useOrders"
import type { Order, OrderStatus } from "@/services/orders-service"
import { Button } from "@/view/components/ui/button"

type OrdersTableProps = {
  orders: Order[]
  isLoading: boolean
  isError: boolean
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار",
  PREPARING: "قيد التحضير",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
}

const nextStatusByStatus: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
}

const proceedButtonLabels: Record<OrderStatus, string> = {
  PENDING: "بدء التحضير",
  PREPARING: "تعيين كجاهز",
  READY: "تأكيد التسليم",
  DELIVERED: "متابعة",
  CANCELLED: "متابعة",
}

function formatStatus(status: OrderStatus) {
  return statusLabels[status] ?? status
}

function getNextStatus(status: OrderStatus) {
  return nextStatusByStatus[status] ?? null
}

function canCancelOrder(status: OrderStatus) {
  return status !== "DELIVERED" && status !== "CANCELLED"
}

function getProceedButtonLabel(status: OrderStatus) {
  return proceedButtonLabels[status] ?? "متابعة"
}

export function OrdersTable({ orders, isLoading, isError }: OrdersTableProps) {
  const navigate = useNavigate()

  const updateStatusMutation = useUpdateOrderStatus()

  function handleProceed(order: Order) {
    const nextStatus = getNextStatus(order.status)

    if (!nextStatus) {
      return
    }

    updateStatusMutation.mutate({
      id: order.id,
      status: nextStatus,
    })
  }

  function handleCancel(order: Order) {
    if (!canCancelOrder(order.status)) {
      return
    }

    updateStatusMutation.mutate({
      id: order.id,
      status: "CANCELLED",
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] bg-[var(--erp-card)] shadow-[var(--erp-shadow)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--erp-accent)]" />
      </div>
    )
  }

  if (isError) {
    return (
      <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <p className="text-sm text-red-500">حدث خطأ أثناء تحميل الطلبات.</p>
      </section>
    )
  }

  return (
    <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <h2 className="mb-5 text-lg font-semibold text-[var(--erp-text)]">
        قائمة الطلبات
      </h2>

      {orders.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
          <PackageCheck className="h-12 w-12 text-[var(--erp-muted)]" />

          <div>
            <h3 className="text-lg font-semibold text-[var(--erp-text)]">
              لا توجد طلبات حالياً
            </h3>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              ستظهر الطلبات هنا عند إضافتها من النظام.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-right">
            <thead>
              <tr className="border-b border-[var(--erp-border)] text-sm text-[var(--erp-muted)]">
                <th className="px-4 py-3 font-medium">رقم الطلب</th>
                <th className="px-4 py-3 font-medium">العميل</th>
                <th className="px-4 py-3 font-medium">العنوان</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
                <th className="px-4 py-3 font-medium">المجموع</th>
                <th className="px-4 py-3 font-medium">الإجراء</th>
                <th className="px-4 py-3 font-medium">تفاصيل</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const nextStatus = getNextStatus(order.status)
                const canProceed = Boolean(nextStatus)
                const canCancel = canCancelOrder(order.status)
                const isFinalStatus =
                  order.status === "DELIVERED" || order.status === "CANCELLED"

                return (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--erp-border)] last:border-0"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-[var(--erp-text)]">
                      #{order.id}
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                      {order.customer?.user?.fullName ??
                        order.customerId ??
                        "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                      {order.deliveryAddress ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[var(--erp-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--erp-accent)]">
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--erp-muted)]">
                      {order.subtotal ?? order.total ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      {isFinalStatus ? (
                        <span className="text-sm text-[var(--erp-muted)]">
                          لا يوجد إجراء
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {canProceed && (
                            <Button
                              size="sm"
                              disabled={updateStatusMutation.isPending}
                              onClick={() => handleProceed(order)}
                              className="bg-green-600 text-white hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {getProceedButtonLabel(order.status)}
                            </Button>
                          )}

                          {canCancel && (
                            <Button
                              size="sm"
                              disabled={updateStatusMutation.isPending}
                              onClick={() => handleCancel(order)}
                              className="bg-red-600 text-white hover:bg-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                              إلغاء
                            </Button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
