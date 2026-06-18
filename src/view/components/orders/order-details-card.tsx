import { Loader2, X } from "lucide-react"

import type { Order } from "@/services/orders-service"
import { Button } from "@/view/components/ui/button"

type OrderDetailsCardProps = {
  orderId: number
  order?: Order
  isLoading: boolean
  onClose: () => void
}

import type { OrderStatus } from "@/services/orders-service"

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "قيد الانتظار",
  PREPARING: "قيد التحضير",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
}

function formatStatus(status: OrderStatus) {
  return statusLabels[status] ?? status
}

export function OrderDetailsCard({
  orderId,
  order,
  isLoading,
  onClose,
}: OrderDetailsCardProps) {
  return (
    <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="text-right">
          <p className="text-sm text-[var(--erp-muted)]">تفاصيل الطلب</p>
          <h2 className="text-lg font-semibold text-[var(--erp-text)]">
            الطلب #{orderId}
          </h2>
        </div>

        <Button size="sm" variant="outline" onClick={onClose}>
          <X className="h-4 w-4" />
          إغلاق
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--erp-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          جارِ تحميل التفاصيل...
        </div>
      ) : order ? (
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--erp-border)] p-4">
            <p className="text-[var(--erp-muted)]">رقم الطلب</p>
            <p className="mt-1 font-semibold text-[var(--erp-text)]">
              #{order.id}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--erp-border)] p-4">
            <p className="text-[var(--erp-muted)]">رقم العميل</p>
            <p className="mt-1 font-semibold text-[var(--erp-text)]">
              {order.customerId ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--erp-border)] p-4">
            <p className="text-[var(--erp-muted)]">الحالة</p>
            <p className="mt-1 font-semibold text-[var(--erp-text)]">
              {formatStatus(order.status)}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--erp-border)] p-4">
            <p className="text-[var(--erp-muted)]">المجموع</p>
            <p className="mt-1 font-semibold text-[var(--erp-text)]">
              {order.subtotal ?? order.total ?? "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--erp-border)] p-4 md:col-span-2">
            <p className="text-[var(--erp-muted)]">عنوان التوصيل</p>
            <p className="mt-1 font-semibold text-[var(--erp-text)]">
              {order.deliveryAddress ?? "-"}
            </p>
          </div>

          {order.createdAt && (
            <div className="rounded-2xl border border-[var(--erp-border)] p-4">
              <p className="text-[var(--erp-muted)]">تاريخ الإنشاء</p>
              <p className="mt-1 font-semibold text-[var(--erp-text)]">
                {new Date(order.createdAt).toLocaleString("ar")}
              </p>
            </div>
          )}

          {order.updatedAt && (
            <div className="rounded-2xl border border-[var(--erp-border)] p-4">
              <p className="text-[var(--erp-muted)]">آخر تحديث</p>
              <p className="mt-1 font-semibold text-[var(--erp-text)]">
                {new Date(order.updatedAt).toLocaleString("ar")}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--erp-muted)]">
          لم يتم العثور على تفاصيل الطلب.
        </p>
      )}
    </section>
  )
}
