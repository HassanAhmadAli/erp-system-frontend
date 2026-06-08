import { useState } from "react"

import { useNavigate } from "react-router-dom"

import { deleteDiscount } from "@/services/discount-service"

export function DeleteDiscountButton({ id }: { id: number }) {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const [message, setMessage] = useState("")

  async function handleDelete() {
    const confirmed = confirm("هل أنت متأكد من حذف الخصم؟")

    if (!confirmed) return

    try {
      setLoading(true)

      const response = await deleteDiscount(id)

      setMessage(response.message)

      setTimeout(() => {
        navigate("/discounts")
      }, 1200)
    } catch (error) {
      setMessage("فشل حذف الخصم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-xl bg-red-600 px-4 py-2 text-white"
      >
        {loading ? "جاري الحذف..." : "حذف الخصم"}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </div>
  )
}
