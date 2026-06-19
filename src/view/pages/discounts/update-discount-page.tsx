import { useEffect, useState } from "react"
import { ArrowRight, Percent } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  DiscountForm,
  type DiscountFormValues,
} from "@/view/components/discount-form"
import { discountSchema } from "@/validation/discount-schema"
import { getDiscountById, updateDiscount } from "@/services/discount-service"
import { formatId } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

function toDateInputValue(value: string | null | undefined) {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

export function EditDiscountPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const discountId = Number(id)

  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [submitError, setSubmitError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: "",
      type: "PERCENTAGE",
      scope: "GLOBAL",
      value: "",
      categoryId: "",
      productId: "",
      maxInvoiceValue: "",
      maxUses: "",
      startDate: "",
      endDate: "",
      isActive: true,
    },
  })

  useEffect(() => {
    async function loadDiscount() {
      if (!Number.isFinite(discountId)) return

      try {
        setLoadError("")
        const discount = await getDiscountById(discountId)

        reset({
          name: discount.name ?? "",
          type: discount.type,
          scope: discount.scope,
          value: String(discount.value ?? ""),
          categoryId: "",
          productId: "",
          maxInvoiceValue: discount.maxInvoiceValue
            ? String(discount.maxInvoiceValue)
            : "",
          maxUses: discount.maxUses ? String(discount.maxUses) : "",
          startDate: toDateInputValue(discount.startDate),
          endDate: toDateInputValue(discount.endDate),
          isActive: discount.isActive,
        })
      } catch (error) {
        console.error(error)
        setLoadError("تعذر تحميل بيانات الخصم.")
      }
    }

    loadDiscount()
  }, [discountId, reset])

  async function onSubmit(data: DiscountFormValues) {
    if (!Number.isFinite(discountId)) return

    try {
      setLoading(true)
      setSubmitError("")

      await updateDiscount(discountId, data)

      navigate("/discounts")
    } catch (err) {
      console.error(err)
      setSubmitError("فشل تعديل الخصم")
    } finally {
      setLoading(false)
    }
  }

  if (!Number.isFinite(discountId)) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-red-500 dark:text-red-300">رقم الخصم غير صالح.</p>
        <BackToDiscountsLink />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              تعديل الخصم #{formatId(discountId)}
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات الخصم ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/discounts/${discountId}`}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {loadError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {loadError}
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DiscountForm register={register} errors={errors} watch={watch} />

            {submitError && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
                {submitError}
              </p>
            )}

            <div className="flex flex-col gap-2 border-t border-[var(--erp-border)] pt-4 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/discounts/${discountId}`)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function BackToDiscountsLink() {
  return (
    <Link
      to="/discounts"
      className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
    >
      <ArrowRight className="size-4" />
      العودة إلى الخصومات
    </Link>
  )
}