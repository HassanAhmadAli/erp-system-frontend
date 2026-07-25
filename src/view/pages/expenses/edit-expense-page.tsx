import { type FormEvent, useEffect, useState } from "react"
import { ArrowRight, Receipt } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { useExpenseById, useUpdateExpense } from "@/hooks/Expenses/useExpenses"
import { formatId } from "@/utils/number-formatters"
import { isValidDateInputValue, isValidId } from "@/validation/helpers"
import {
  expenseFormValuesToPayload,
  expenseSchema,
  expenseZodErrorToFormErrors,
  type ExpenseFormErrors,
  type ExpenseFormValues,
} from "@/validation/expense-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: ExpenseFormValues = {
  description: "",
  category: "",
  amount: "",
  expenseDate: "",
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return ""

  const candidate = value.slice(0, 10)

  return isValidDateInputValue(candidate) ? candidate : ""
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function EditExpensePage() {
  const { id } = useParams()
  const expenseId = Number(id)
  const navigate = useNavigate()

  const { data: expense, isLoading, isError } = useExpenseById(expenseId)
  const updateMutation = useUpdateExpense()

  const [form, setForm] = useState<ExpenseFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<ExpenseFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!expense) return

    setForm({
      description: expense.description ?? "",
      category: expense.category ?? "",
      amount: String(expense.amount ?? ""),
      expenseDate: toDateInputValue(expense.expenseDate),
    })
    setErrors({})
    setErrorMessage("")
  }, [expense])

  function setField(key: keyof ExpenseFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!isValidId(expenseId)) {
      setErrorMessage("رقم المصروف غير صالح")
      return
    }

    const validationResult = expenseSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(expenseZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      await updateMutation.mutateAsync({
        id: expenseId,
        data: expenseFormValuesToPayload(validationResult.data),
      })

      navigate(`/expenses/${expenseId}`)
    } catch {
      setErrorMessage("فشل تحديث المصروف، حاول مرة أخرى")
    }
  }

  if (!isValidId(expenseId)) {
    return <ErrorMessage message="رقم المصروف غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات المصروف...</p>
      </div>
    )
  }

  if (isError || !expense) {
    return <ErrorMessage message="تعذر تحميل بيانات المصروف." />
  }

  return (
    <div
      className="mx-auto max-w-3xl space-y-6 text-right text-[var(--erp-text)]"
      dir="rtl"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              تعديل المصروف #{formatId(expenseId)}
            </h1>

            <Receipt className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات المصروف ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/expenses/${expenseId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="edit-expense-description" className={labelClass}>
              الوصف
            </label>

            <input
              id="edit-expense-description"
              className={inputClass}
              placeholder="أدخل وصف المصروف"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
            <ErrorText message={errors.description} />
          </div>

          <div>
            <label htmlFor="edit-expense-category" className={labelClass}>
              الفئة
            </label>

            <input
              id="edit-expense-category"
              className={inputClass}
              placeholder="مثال: إيجار، رواتب، كهرباء"
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            />
            <ErrorText message={errors.category} />
          </div>

          <div>
            <label htmlFor="edit-expense-amount" className={labelClass}>
              المبلغ
            </label>

            <input
              id="edit-expense-amount"
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              placeholder="أدخل المبلغ"
              value={form.amount}
              onChange={(event) => setField("amount", event.target.value)}
            />
            <ErrorText message={errors.amount} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-expense-date" className={labelClass}>
              تاريخ المصروف
            </label>

            <input
              id="edit-expense-date"
              type="date"
              className={`${inputClass} [direction:ltr]`}
              value={form.expenseDate}
              onChange={(event) => setField("expenseDate", event.target.value)}
            />
            <ErrorText message={errors.expenseDate} />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--erp-border)] pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/expenses/${expenseId}`)}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/expenses"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        <ArrowRight className="size-4" />
        العودة إلى المصروفات
      </Link>
    </div>
  )
}