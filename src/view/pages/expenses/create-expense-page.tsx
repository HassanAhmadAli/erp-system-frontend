import { type FormEvent, useState } from "react"
import { ArrowRight, Receipt } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { useCreateExpense } from "@/hooks/Expenses/useExpenses"
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

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: ExpenseFormValues = {
  description: "",
  category: "",
  amount: "",
  expenseDate: getTodayDateInputValue(),
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function CreateExpensePage() {
  const navigate = useNavigate()
  const createMutation = useCreateExpense()

  const [form, setForm] = useState<ExpenseFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<ExpenseFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  function setField(key: keyof ExpenseFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    const validationResult = expenseSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(expenseZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      await createMutation.mutateAsync(
        expenseFormValuesToPayload(validationResult.data)
      )

      navigate("/expenses")
    } catch {
      setErrorMessage("فشل إنشاء المصروف، حاول مرة أخرى")
    }
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
              إضافة مصروف
            </h1>

            <Receipt className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أدخل بيانات المصروف ثم اضغط حفظ.
          </p>
        </div>

        <Link
          to="/expenses"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى المصروفات
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="expense-description" className={labelClass}>
              الوصف
            </label>

            <input
              id="expense-description"
              className={inputClass}
              placeholder="أدخل وصف المصروف"
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
            <ErrorText message={errors.description} />
          </div>

          <div>
            <label htmlFor="expense-category" className={labelClass}>
              الفئة
            </label>

            <input
              id="expense-category"
              className={inputClass}
              placeholder="مثال: إيجار، رواتب، كهرباء"
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            />
            <ErrorText message={errors.category} />
          </div>

          <div>
            <label htmlFor="expense-amount" className={labelClass}>
              المبلغ
            </label>

            <input
              id="expense-amount"
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
            <label htmlFor="expense-date" className={labelClass}>
              تاريخ المصروف
            </label>

            <input
              id="expense-date"
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "جاري الحفظ..." : "إضافة المصروف"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/expenses")}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}