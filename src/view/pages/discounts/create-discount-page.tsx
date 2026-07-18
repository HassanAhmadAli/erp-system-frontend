import { useState } from "react"
import { ArrowRight, Percent } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { DiscountForm } from "@/view/components/discount-form"
import {
  discountSchema,
  type DiscountFormValues,
} from "@/validation/discount-schema"
import { createDiscount } from "@/services/discount-service"
import { Button } from "@/view/components/ui/button"

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function CreateDiscountPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema) as Resolver<DiscountFormValues>,
    defaultValues: {
      name: "",
      type: "PERCENTAGE",
      scope: "GLOBAL",
      value: "",
      categoryId: "",
      productId: "",
      maxInvoiceValue: "",
      maxUses: "",
      startDate: getTodayDateInputValue(),
      endDate: "",
      isActive: true,
    },
  })

  async function onSubmit(data: DiscountFormValues) {
    try {
      setLoading(true)
      setErrorMessage("")

      await createDiscount(data)

      navigate("/discounts")
    } catch (error) {
      console.error(error)
      setErrorMessage("فشل إنشاء الخصم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="mx-auto max-w-4xl space-y-6 text-right text-[var(--erp-text)]"
      dir="rtl"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              إنشاء خصم جديد
            </h1>

            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أدخل بيانات الخصم وحدد نوعه ونطاق تطبيقه.
          </p>
        </div>

        <Link
          to="/discounts"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى الخصومات
        </Link>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <DiscountForm register={register} errors={errors} watch={watch} />

          {errorMessage && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-[var(--erp-border)] pt-4 sm:flex-row sm:justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ الخصم"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/discounts")}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}