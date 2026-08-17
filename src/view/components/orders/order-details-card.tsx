import type { ReactNode } from "react"
import {
  Calendar,
  ClipboardList,
  Hash,
  Loader2,
  MapPin,
  Package,
  User,
  Wallet,
  X,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import type { Order } from "@/services/orders-service"
import {
  formatCurrency,
  formatDateTime,
  formatId,
  formatNumber,
} from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

type OrderDetailsCardProps = {
  orderId: number
  order?: Order
  isLoading: boolean
  onClose: () => void
}

type OrderWithOptionalDetails = Order & {
  total?: string | number | null
  totalAmount?: string | number | null
  subtotal?: string | number | null
  discountAmount?: string | number | null
  deliveryFee?: string | number | null
  loyaltyPointsUsed?: string | number | null
  customer?: {
    id?: number
    user?: {
      fullName?: string | null
      email?: string | null
      phoneNumber?: string | null
    } | null
  } | null
  items?: OrderItemLike[]
}

type OrderItemLike = {
  id?: number
  productId?: number
  quantity?: string | number | null
  unitPrice?: string | number | null
  price?: string | number | null
  priceAtPurchase?: string | number | null
  subtotal?: string | number | null
  total?: string | number | null
  totalPrice?: string | number | null
  product?: {
    id?: number
    name?: string | null
  } | null
}

const ORDER_STATUS_KEYS: Record<string, string> = {
  PENDING: "statuses.pending",
  PREPARING: "statuses.preparing",
  OUT_FOR_DELIVERY: "statuses.outForDelivery",
  DELIVERED: "statuses.delivered",
  CANCELLED: "statuses.cancelled",
}

const statusStyles: Record<string, string> = {
  PENDING:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  PREPARING:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  OUT_FOR_DELIVERY:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  DELIVERED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
}

function formatOptionalCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  return formatCurrency(value)
}

function getOrderTotal(order: OrderWithOptionalDetails) {
  return order.totalAmount ?? order.total ?? order.subtotal ?? null
}

function getItemUnitPrice(item: OrderItemLike) {
  return item.unitPrice ?? item.price ?? item.priceAtPurchase ?? null
}

function getItemTotal(item: OrderItemLike) {
  if (item.subtotal !== undefined && item.subtotal !== null) {
    return item.subtotal
  }

  if (item.totalPrice !== undefined && item.totalPrice !== null) {
    return item.totalPrice
  }

  if (item.total !== undefined && item.total !== null) {
    return item.total
  }

  const unitPrice = Number(getItemUnitPrice(item))
  const quantity = Number(item.quantity)

  if (Number.isNaN(unitPrice) || Number.isNaN(quantity)) {
    return null
  }

  return unitPrice * quantity
}

function StatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation("common")
  const safeStatus = String(status ?? "PENDING").toUpperCase()
  const statusKey = ORDER_STATUS_KEYS[safeStatus]

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[safeStatus] ??
        "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300"
      }`}
    >
      {statusKey ? t(statusKey) : safeStatus}
    </span>
  )
}

export function OrderDetailsCard({
  orderId,
  order,
  isLoading,
  onClose,
}: OrderDetailsCardProps) {
  const { t } = useTranslation(["common", "pages"])
  const orderDetails = order as OrderWithOptionalDetails | undefined
  const items = orderDetails?.items ?? []

  function getCustomerName(orderData: OrderWithOptionalDetails) {
    return (
      orderData.customer?.user?.fullName ||
      orderData.customer?.user?.email ||
      (orderData.customerId
        ? t("common:customerFallback", {
            id: formatId(orderData.customerId),
          })
        : t("common:notAvailable"))
    )
  }

  return (
    <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-start">
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:orders.detailsTitle", { id: formatId(orderId) })}
            </h1>

            <ClipboardList className="size-6 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:orders.detailsSubtitle")}
          </p>
        </div>

        <Button size="sm" variant="outline" className="gap-2" onClick={onClose}>
          <X className="size-4" />
          {t("common:close")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-sm text-[var(--erp-muted)]">
          <Loader2 className="size-4 animate-spin" />
          {t("common:loadingDetails")}
        </div>
      ) : orderDetails ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <SummaryCard
              label={t("common:orderId")}
              value={`#${formatId(orderDetails.id)}`}
              icon={<Hash className="size-5" />}
              ltr
            />

            <SummaryCard
              label={t("common:customer")}
              value={getCustomerName(orderDetails)}
              icon={<User className="size-5" />}
            />

            <SummaryCard
              label={t("common:status")}
              value={<StatusBadge status={orderDetails.status} />}
              icon={<ClipboardList className="size-5" />}
            />

            <SummaryCard
              label={t("common:total")}
              value={formatOptionalCurrency(getOrderTotal(orderDetails))}
              icon={<Wallet className="size-5" />}
              ltr
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <InfoCard
              label={t("common:customerId")}
              value={
                orderDetails.customerId
                  ? `#${formatId(orderDetails.customerId)}`
                  : t("common:notAvailable")
              }
              icon={<User className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("common:subtotal")}
              value={formatOptionalCurrency(orderDetails.subtotal)}
              icon={<Wallet className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("common:discountValue")}
              value={formatOptionalCurrency(orderDetails.discountAmount)}
              icon={<Wallet className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("common:deliveryFee")}
              value={formatOptionalCurrency(orderDetails.deliveryFee)}
              icon={<Wallet className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("common:loyaltyPointsUsed")}
              value={formatNumber(orderDetails.loyaltyPointsUsed ?? 0)}
              icon={<Hash className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("common:createdAt")}
              value={formatDateTime(orderDetails.createdAt)}
              icon={<Calendar className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("common:updatedAt")}
              value={formatDateTime(orderDetails.updatedAt)}
              icon={<Calendar className="size-4" />}
              ltr
            />

            <InfoCard
              label={t("pages:orders.deliveryAddress")}
              value={orderDetails.deliveryAddress ?? t("common:notAvailable")}
              icon={<MapPin className="size-4" />}
              className="md:col-span-2"
            />
          </section>

          <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-bg)] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--erp-muted)]">
                {t("common:productCountSuffix", {
                  count: formatNumber(items.length),
                })}
              </span>

              <div className="flex items-center justify-end gap-2">
                <h2 className="text-lg font-bold text-[var(--erp-text)]">
                  {t("pages:orders.orderItems")}
                </h2>

                <Package className="size-5 text-[var(--erp-brand-solid)]" />
              </div>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] p-8 text-center text-sm text-[var(--erp-muted)]">
                {t("pages:orders.noOrderItems")}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)]">
                <table className="w-full min-w-[640px] table-fixed text-start text-sm">
                  <colgroup>
                    <col className="w-[16%]" />
                    <col className="w-[36%]" />
                    <col className="w-[14%]" />
                    <col className="w-[17%]" />
                    <col className="w-[17%]" />
                  </colgroup>

                  <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-xs text-[var(--erp-muted)]">
                    <tr>
                      <th className="px-3 py-3 font-medium">
                        {t("common:productId")}
                      </th>
                      <th className="px-3 py-3 font-medium">
                        {t("common:productName")}
                      </th>
                      <th className="px-3 py-3 font-medium">
                        {t("common:quantity")}
                      </th>
                      <th className="px-3 py-3 font-medium">
                        {t("common:unitPrice")}
                      </th>
                      <th className="px-3 py-3 font-medium">
                        {t("common:total")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={item.id ?? `${item.productId}-${index}`}
                        className="border-b border-[var(--erp-border)] last:border-b-0 hover:bg-[var(--erp-bg)]"
                      >
                        <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                          {item.productId
                            ? `#${formatId(item.productId)}`
                            : t("common:notAvailable")}
                        </td>

                        <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                          <span className="block truncate">
                            {item.product?.name || t("common:notAvailable")}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-[var(--erp-text)]">
                          {formatNumber(item.quantity)}
                        </td>

                        <td className="px-3 py-3 text-[var(--erp-text)]">
                          {formatOptionalCurrency(getItemUnitPrice(item))}
                        </td>

                        <td className="px-3 py-3 font-semibold text-[var(--erp-text)]">
                          {formatOptionalCurrency(getItemTotal(item))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <p className="text-sm text-[var(--erp-muted)]">
          {t("pages:orders.detailsNotFound")}
        </p>
      )}
    </section>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  ltr = false,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  ltr?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-xs text-[var(--erp-muted)]">{label}</p>
      </div>

      <div
        dir={ltr ? "ltr" : "rtl"}
        className="mt-3 font-semibold text-[var(--erp-text)] tabular-nums"
      >
        {value}
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  icon,
  ltr = false,
  className = "",
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  ltr?: boolean
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 ${className}`}
    >
      <div className="mb-2 flex items-center justify-end gap-2">
        <p className="text-xs text-[var(--erp-muted)]">{label}</p>
        <span className="text-[var(--erp-brand-solid)]">{icon}</span>
      </div>

      <div
        dir={ltr ? "ltr" : "rtl"}
        className="font-semibold text-[var(--erp-text)] tabular-nums"
      >
        {value}
      </div>
    </div>
  )
}
