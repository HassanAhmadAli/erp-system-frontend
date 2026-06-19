import { useNavigate, useParams } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"

import { useOrder } from "@/hooks/useOrders"
import { OrderDetailsCard } from "@/view/components/orders/order-details-card"
import { Button } from "@/view/components/ui/button"

export function OrderDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const orderId = Number(id)
  const { data: order, isLoading, isError } = useOrder(orderId)

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return (
      <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/orders")}
        >
          <ArrowRight className="size-4" />
          العودة للطلبات
        </Button>

        <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-red-500 dark:text-red-300">
            رقم الطلب غير صالح.
          </p>
        </section>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[300px] items-center justify-center text-[var(--erp-text)]">
        <Loader2 className="size-8 animate-spin text-[var(--erp-brand-solid)]" />
      </main>
    )
  }

  if (isError || !order) {
    return (
      <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/orders")}
        >
          <ArrowRight className="size-4" />
          العودة للطلبات
        </Button>

        <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-red-500 dark:text-red-300">
            لم يتم العثور على الطلب.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => navigate("/orders")}
      >
        <ArrowRight className="size-4" />
        العودة للطلبات
      </Button>

      <OrderDetailsCard
        orderId={orderId}
        order={order}
        isLoading={false}
        onClose={() => navigate("/orders")}
      />
    </main>
  )
}