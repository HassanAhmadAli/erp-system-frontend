import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { DiscountForm } from "@/view/components/discount-form"
import { discountSchema } from "@/validation/discount-schema"
import { createDiscount } from "@/services/discount-service"

export function CreateDiscountPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      type: "PERCENTAGE",
      scope: "GLOBAL",
      isActive: true,
    },
  })

  async function onSubmit(data: any) {
    try {
      setLoading(true)

      await createDiscount(data)

      navigate("/discounts")
    } catch (err) {
      console.error(err)
      alert("فشل إنشاء الخصم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="mb-6 text-xl font-bold">إنشاء خصم جديد</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DiscountForm register={register} errors={errors} watch={watch} />

          {/* BUTTON ALWAYS VISIBLE */}
          <div className="flex justify-end border-t pt-4">
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-green-600 px-6 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ الخصم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
