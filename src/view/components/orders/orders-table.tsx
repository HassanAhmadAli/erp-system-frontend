import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Eye, Loader2, PackageCheck, XCircle } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useUpdateOrderStatus } from "@/hooks/useOrders"
import { PERMISSIONS } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"
import type { Order, OrderStatus } from "@/services/orders-service"
import { isValidId } from "@/validation/helpers"
import { Button } from "@/view/components/ui/button"

type OrdersTableProps = {
  orders: Order[]
  isLoading: boolean
  isError: boolean
}

const ORDER_STATUS_KEYS: Record<OrderStatus, string> = {
  PENDING: "statuses.pending",
  PREPARING: "statuses.preparing",
  OUT_FOR_DELIVERY: "statuses.outForDelivery",
  DELIVERED: "statuses.delivered",
  CANCELLED: "statuses.cancelled",
}

const nextStatusByStatus: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
}

const proceedButtonKeys: Record<OrderStatus, string> = {
  PENDING: "pages:orders.startPreparing",
  PREPARING: "pages:orders.sendForDelivery",
  OUT_FOR_DELIVERY: "pages:orders.confirmDelivery",
  DELIVERED: "common:proceed",
  CANCELLED: "common:proceed",
}

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]

function getNextStatus(status: OrderStatus) {
  return nextStatusByStatus[status] ?? null
}

function canCancelOrder(status: OrderStatus) {
  return status !== "DELIVERED" && status !== "CANCELLED"
}

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_OPTIONS.includes(value as OrderStatus)
}

export function OrdersTable({ orders, isLoading, isError }: OrdersTableProps) {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.ORDERS_MANAGE)

  const updateStatusMutation = useUpdateOrderStatus()
  const [statusError, setStatusError] = useState("")

  function formatStatus(status: OrderStatus) {
    const key = ORDER_STATUS_KEYS[status]
    return key ? t(`common:${key}`) : status
  }

  function getProceedButtonLabel(status: OrderStatus) {
    return t(proceedButtonKeys[status] ?? "common:proceed")
  }

  function handleProceed(order: Order) {
    setStatusError("")

    if (!isValidId(order.id)) {
      setStatusError(t("pages:orders.invalidOrderId"))
      return
    }

    if (!isOrderStatus(order.status)) {
      setStatusError(t("pages:orders.invalidOrderStatus"))
      return
    }

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
    setStatusError("")

    if (!isValidId(order.id)) {
      setStatusError(t("pages:orders.invalidOrderId"))
      return
    }

    if (!isOrderStatus(order.status)) {
      setStatusError(t("pages:orders.invalidOrderStatus"))
      return
    }

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
        <p className="text-sm text-red-500">{t("pages:orders.loadFailed")}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <h2 className="mb-5 text-lg font-semibold text-[var(--erp-text)]">
        {t("pages:orders.listTitle")}
      </h2>

      {orders.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
          <PackageCheck className="h-12 w-12 text-[var(--erp-muted)]" />

          <div>
            <h3 className="text-lg font-semibold text-[var(--erp-text)]">
              {t("pages:orders.noOrders")}
            </h3>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("pages:orders.noOrdersHint")}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-start">
            <thead>
              <tr className="border-b border-[var(--erp-border)] text-sm text-[var(--erp-muted)]">
                <th className="px-4 py-3 font-medium">{t("common:orderId")}</th>
                <th className="px-4 py-3 font-medium">
                  {t("common:customer")}
                </th>
                <th className="px-4 py-3 font-medium">{t("common:address")}</th>
                <th className="px-4 py-3 font-medium">{t("common:status")}</th>
                <th className="px-4 py-3 font-medium">
                  {t("common:subtotal")}
                </th>
                <th className="px-4 py-3 font-medium">{t("common:actions")}</th>
                <th className="px-4 py-3 font-medium">{t("common:details")}</th>
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
                          {t("common:noAction")}
                        </span>
                      ) : !canManage ? (
                        <span className="text-sm text-[var(--erp-muted)]">
                          {t("common:noPermission")}
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
                              {t("pages:orders.cancelOrder")}
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
                        {t("common:view")}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {statusError && (
        <p className="mt-4 rounded-[16px] bg-red-50 px-4 py-3 text-sm text-red-600">
          {statusError}
        </p>
      )}
    </section>
  )
}
