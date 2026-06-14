import { useState } from "react"
import { Plus } from "lucide-react"

import { useCreateOrder } from "@/hooks/useOrders"
import type { CreateOrderPayload } from "@/services/orders-service"
import { Button } from "@/view/components/ui/button"

export function CreateOrderForm() {
  const createOrderMutation = useCreateOrder()

  const [customerId, setCustomerId] = useState("")
  const [discountId, setDiscountId] = useState("")
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState("0")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("1")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload: CreateOrderPayload = {
      customerId: Number(customerId),
      discountId: discountId ? Number(discountId) : null,
      loyaltyPointsUsed: Number(loyaltyPointsUsed),
      deliveryAddress,
      items: [
        {
          productId: Number(productId),
          quantity: Number(quantity),
        },
      ],
    }

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        setCustomerId("")
        setDiscountId("")
        setLoyaltyPointsUsed("0")
        setDeliveryAddress("")
        setProductId("")
        setQuantity("1")
      },
    })
  }

  return (
    <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex items-center gap-2">
        <Plus className="h-5 w-5 text-[var(--erp-accent)]" />
        <h2 className="text-lg font-semibold text-[var(--erp-text)]">
          إنشاء طلب جديد
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 md:grid-cols-3"
      >
        <input
          required
          type="number"
          placeholder="رقم العميل"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
        />

        <input
          type="number"
          placeholder="رقم الخصم (اختياري)"
          value={discountId}
          onChange={(event) => setDiscountId(event.target.value)}
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
        />

        <input
          type="number"
          placeholder="نقاط الولاء المستخدمة"
          value={loyaltyPointsUsed}
          onChange={(event) => setLoyaltyPointsUsed(event.target.value)}
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
        />

        <input
          required
          placeholder="عنوان التوصيل"
          value={deliveryAddress}
          onChange={(event) => setDeliveryAddress(event.target.value)}
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none md:col-span-3"
        />

        <input
          required
          type="number"
          placeholder="رقم المنتج"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
        />

        <input
          required
          type="number"
          min={1}
          placeholder="الكمية"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
        />

        <Button
          type="submit"
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending
            ? "جارِ إنشاء الطلب..."
            : "إنشاء الطلب"}
        </Button>
      </form>
    </section>
  )
}