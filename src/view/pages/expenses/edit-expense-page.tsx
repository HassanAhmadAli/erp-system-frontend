import { type FormEvent, useEffect, useState } from "react"
import { ArrowRight, Receipt } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { useExpenseById, useUpdateExpense } from "@/hooks/Expenses/useExpenses"
import { formatId } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

export function EditExpensePage() {
  const { id } = useParams()
  const expenseId = Number(id)
  const navigate = useNavigate()

  const { data: expense, isLoading, isError } = useExpenseById(expenseId)
  const updateMutation = useUpdateExpense()

  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [expenseDate, setExpenseDate] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (expense) {
      setDescription(expense.description ?? "")
      setCategory(expense.category ?? "")
      setAmount(String(expense.amount ?? ""))
      setExpenseDate(expense.expenseDate?.slice(0, 10) ?? "")
    }
  }, [expense])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!description.trim()) {
      setErrorMessage("الوصف مطلوب")
      return
    }

    if (!category.trim()) {
      setErrorMessage("الفئة مطلوبة")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setErrorMessage("المبلغ يجب أن يكون أكبر من صفر")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: expenseId,
        data: {
          description: description.trim(),
          category: category.trim(),
          amount: Number(amount),
          expenseDate,
        },
      })

      navigate(`/expenses/${expenseId}`)
    } catch {
      setErrorMessage("فشل تحديث المصروف، حاول مرة أخرى")
    }
  }

  if (!Number.isFinite(expenseId)) {
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
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="edit-expense-category" className={labelClass}>
              الفئة
            </label>

            <input
              id="edit-expense-category"
              className={inputClass}
              placeholder="مثال: إيجار، رواتب، كهرباء"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
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
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-expense-date" className={labelClass}>
              تاريخ المصروف
            </label>

            <input
              id="edit-expense-date"
              type="date"
              className={`${inputClass} [direction:ltr]`}
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
            />
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
