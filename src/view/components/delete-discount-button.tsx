import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useNavigate } from "react-router-dom"

import { deleteDiscount } from "@/services/discount-service"

export function DeleteDiscountButton({ id }: { id: number }) {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleDelete() {
    const confirmed = confirm(t("pages:discounts.confirmDeleteQuestion"))

    if (!confirmed) return

    try {
      setLoading(true)

      const response = await deleteDiscount(id)

      setMessage(response.message)

      setTimeout(() => {
        navigate("/discounts")
      }, 1200)
    } catch {
      setMessage(t("pages:discounts.deleteFailed"))
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
        {loading ? t("common:deleting") : t("pages:discounts.deleteDiscount")}
      </button>

      {message && <p className="text-sm">{message}</p>}
    </div>
  )
}
