import {
  ArrowRight,
  Calendar,
  FolderOpen,
  Hash,
  Pencil,
  Receipt,
  User,
  Wallet,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { useExpenseById } from "@/hooks/Expenses/useExpenses"
import { formatExpenseAmount } from "@/services/expense-service"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"
import { Button } from "@/view/components/ui/button"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDateTime(date?: string) {
  if (!date) return "—"
  return new Date(date).toLocaleString("ar-SY")
}

function formatAmount(amount: number | string) {
  return formatExpenseAmount(amount)
}

export function ExpenseDetailsPage() {
  const { id } = useParams()
  const expenseId = Number(id)

  const { data: expense, isLoading, isError } = useExpenseById(expenseId)

  if (!Number.isFinite(expenseId)) {
    return <ErrorMessage message="رقم المصروف غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 text-right" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات المصروف...</p>
      </div>
    )
  }

  if (isError || !expense) {
    return <ErrorMessage message="تعذر تحميل بيانات المصروف." />
  }

  const recordedByName =
    expense.recordedBy?.fullName ??
    (expense.recordedById ? `#${expense.recordedById}` : "—")

  return (
    <div className="space-y-6 p-6 text-right" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{expense.description}</h1>
          <p className="mt-2 text-[var(--erp-muted)]">
            {expense.category} — {formatDate(expense.expenseDate)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/expenses/${expenseId}/edit`}>
            <Button className="gap-2">
              <Pencil className="size-4" />
              تعديل المصروف
            </Button>
          </Link>
          <Link
            to="/expenses"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
          >
            <ArrowRight className="size-4" />
            العودة إلى المصروفات
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="المبلغ"
          value={formatAmount(expense.amount)}
          icon={<Wallet className="size-5" />}
        />
        <SummaryCard
          label="الفئة"
          value={expense.category}
          icon={<FolderOpen className="size-5" />}
        />
        <SummaryCard
          label="رقم المصروف"
          value={expense.id}
          icon={<Hash className="size-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title="معلومات المصروف">
          <CustomerInfoRow label="الوصف" value={expense.description} />
          <CustomerInfoRow label="الفئة" value={expense.category} />
          <CustomerInfoRow
            label="المبلغ"
            value={formatAmount(expense.amount)}
          />
          <CustomerInfoRow
            label="تاريخ المصروف"
            value={formatDate(expense.expenseDate)}
          />
          <CustomerInfoRow label="رقم المصروف" value={expense.id} />
        </CustomerInfoCard>

        <CustomerInfoCard title="معلومات التسجيل">
          <CustomerInfoRow label="سجّله" value={recordedByName} />
          <CustomerInfoRow
            label="البريد الإلكتروني"
            value={expense.recordedBy?.email ?? "—"}
          />
          <CustomerInfoRow
            label="تاريخ الإنشاء"
            value={formatDateTime(expense.createdAt)}
          />
          <CustomerInfoRow
            label="آخر تحديث"
            value={formatDateTime(expense.updatedAt)}
          />
        </CustomerInfoCard>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-end gap-2">
          <h2 className="text-xl font-semibold">ملخص سريع</h2>
          <Receipt className="size-5 text-[var(--erp-brand)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label="الوصف"
            value={expense.description}
            icon={<Receipt className="size-4" />}
          />
          <InfoRow
            label="المبلغ"
            value={formatAmount(expense.amount)}
            icon={<Wallet className="size-4" />}
          />
          <InfoRow
            label="الفئة"
            value={expense.category}
            icon={<FolderOpen className="size-4" />}
          />
          <InfoRow
            label="التاريخ"
            value={formatDate(expense.expenseDate)}
            icon={<Calendar className="size-4" />}
          />
          {expense.recordedBy && (
            <InfoRow
              label="المسجّل"
              value={expense.recordedBy.fullName ?? "—"}
              icon={<User className="size-4" />}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[var(--erp-brand)]">{icon}</span>
        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-1 flex items-center justify-end gap-2 text-sm text-[var(--erp-muted)]">
        <span>{label}</span>
        {icon}
      </div>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 p-6 text-right" dir="rtl">
      <p className="text-red-500">{message}</p>
      <Link
        to="/expenses"
        className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
      >
        <ArrowRight className="size-4" />
        العودة إلى المصروفات
      </Link>
    </div>
  )
}
