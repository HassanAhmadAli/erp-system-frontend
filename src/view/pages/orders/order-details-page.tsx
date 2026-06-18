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

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--erp-accent)]" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <section className="space-y-4" dir="rtl">
        <Button variant="outline" onClick={() => navigate("/orders")}>
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Button>

        <div className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-red-500">لم يتم العثور على الطلب.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6" dir="rtl">
      <Button variant="outline" onClick={() => navigate("/orders")}>
        <ArrowRight className="h-4 w-4" />
        العودة للطلبات
      </Button>

      <OrderDetailsCard
        orderId={orderId}
        order={order}
        isLoading={false}
        onClose={() => navigate("/orders")}
      />
    </section>
  )
}
