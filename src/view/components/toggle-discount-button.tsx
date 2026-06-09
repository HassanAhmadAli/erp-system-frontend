import { useState } from "react"

import { useQueryClient } from "@tanstack/react-query"

import { toggleDiscount } from "@/services/discount-service"

type Props = {
  id: number
  isActive: boolean
}

export function ToggleDiscountButton({ id, isActive }: Props) {
  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState("")

  const queryClient = useQueryClient()

  async function handleToggle() {
    try {
      setLoading(true)
      setMessage("")

      await toggleDiscount(id, !isActive)

      setMessage("تم تحديث الحالة بنجاح")

      queryClient.invalidateQueries({
        queryKey: ["discounts"],
      })

      queryClient.invalidateQueries({
        queryKey: ["discount", id],
      })
    } catch (error) {
      setMessage("فشل تحديث الحالة")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "جاري التحديث..." : isActive ? "تعطيل الخصم" : "تفعيل الخصم"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </div>
  )
}
