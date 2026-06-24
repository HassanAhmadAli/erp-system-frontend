import { ArrowRight, Percent } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import { useDiscountById } from "@/hooks/use-discounts"
import {
  deleteDiscount,
  toggleDiscount,
  type DiscountScope,
  type DiscountType,
} from "@/services/discount-service"
import {
  formatId,
  formatNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

function getDiscountTypeLabel(type: DiscountType) {
  return type === "PERCENTAGE" ? "نسبة مئوية" : "مبلغ ثابت"
}

function getDiscountScopeLabel(scope: DiscountScope) {
  const labels: Record<DiscountScope, string> = {
    GLOBAL: "عام",
    CATEGORY: "تصنيف",
    PRODUCT: "منتج",
    CUSTOMER: "عميل",
  }

  return labels[scope]
}

function formatDiscountValue(type: DiscountType, value: string) {
  const formattedValue = formatNumber(value)

  return type === "PERCENTAGE" ? `${formattedValue}%` : `${formattedValue} SYP`
}

function formatLocalDate(value: string | null) {
  if (!value) return "لا يوجد"

  return toEnglishDigits(
    new Date(value).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  )
}

export function DiscountDetailsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const id = Number(params.id)

  const { data, isLoading, error } = useDiscountById(id)

  async function handleToggle() {
    if (!data) return

    try {
      await toggleDiscount(data.id, !data.isActive)
      queryClient.invalidateQueries({ queryKey: ["discount", data.id] })
      queryClient.invalidateQueries({ queryKey: ["discounts"] })
    } catch (err) {
      console.error(err)
      alert("فشل تحديث حالة الخصم")
    }
  }

  async function handleDelete() {
    if (!data) return

    const shouldDelete = window.confirm("هل أنت متأكد من حذف هذا الخصم؟")
    if (!shouldDelete) return

    try {
      await deleteDiscount(data.id)
      navigate("/discounts")
    } catch (err) {
      console.error(err)
      alert("فشل حذف الخصم")
    }
  }

  if (!Number.isFinite(id)) {
    return <ErrorMessage message="رقم الخصم غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل الخصم...</p>
      </div>
    )
  }

  if (error || !data) {
    return <ErrorMessage message="فشل تحميل الخصم." />
  }

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {data.name}
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            تفاصيل الخصم وحالته وحدود استخدامه.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/discounts/${data.id}/edit`}>
            <Button>تعديل الخصم</Button>
          </Link>

          <Link
            to="/discounts"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            العودة إلى الخصومات
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="رقم الخصم" value={formatId(data.id)} />
        <SummaryCard label="النوع" value={getDiscountTypeLabel(data.type)} />
        <SummaryCard label="النطاق" value={getDiscountScopeLabel(data.scope)} />
        <SummaryCard
          label="القيمة"
          value={formatDiscountValue(data.type, data.value)}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 className="mb-5 text-xl font-semibold text-[var(--erp-text)]">
          معلومات الخصم
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="الحالة" value={data.isActive ? "مفعل" : "معطل"} />
          <InfoRow label="عدد الاستخدام" value={formatNumber(data.usedCount)} />
          <InfoRow
            label="الحد الأقصى للاستخدام"
            value={data.maxUses ? formatNumber(data.maxUses) : "غير محدود"}
          />
          <InfoRow
            label="أقصى قيمة للفاتورة"
            value={
              data.maxInvoiceValue
                ? `${formatNumber(data.maxInvoiceValue)} SYP`
                : "غير محدود"
            }
          />
          <InfoRow
            label="تاريخ البداية"
            value={formatLocalDate(data.startDate)}
          />
          <InfoRow
            label="تاريخ النهاية"
            value={formatLocalDate(data.endDate)}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--erp-border)] pt-4">
          <Button
            variant={data.isActive ? "destructive" : "success"}
            onClick={handleToggle}
          >
            {data.isActive ? "تعطيل الخصم" : "تفعيل الخصم"}
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            حذف الخصم
          </Button>
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-1 font-medium text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/discounts"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        العودة إلى الخصومات
      </Link>
    </div>
  )
}
