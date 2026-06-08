import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"

import { DiscountForm } from "@/view/components/discount-form"
import { getDiscountById, updateDiscount } from "@/services/discount-service"

export function EditDiscountPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    async function load() {
      const data = await getDiscountById(Number(id))

      Object.entries(data).forEach(([key, value]) => {
        setValue(key as any, value)
      })
    }

    load()
  }, [id])

  async function onSubmit(data: any) {
    try {
      setLoading(true)

      await updateDiscount(Number(id), data)

      navigate("/discounts")
    } catch (err) {
      console.error(err)
      alert("فشل التعديل")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="mb-6 text-xl font-bold">تعديل الخصم</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DiscountForm register={register} errors={errors} watch={watch} />

          <div className="flex justify-end border-t pt-4">
            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
