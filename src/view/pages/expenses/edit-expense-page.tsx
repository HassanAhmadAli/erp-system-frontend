import { ArrowRight } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

import { useExpenseById, useUpdateExpense } from "@/hooks/Expenses/useExpenses"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"

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
      setDescription(expense.description)
      setCategory(expense.category)
      setAmount(String(expense.amount))
      setExpenseDate(expense.expenseDate.slice(0, 10))
    }
  }, [expense])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
          description,
          category,
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
      <div className="space-y-6 p-6 text-right" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات المصروف...</p>
      </div>
    )
  }

  if (isError || !expense) {
    return <ErrorMessage message="تعذر تحميل بيانات المصروف." />
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تعديل المصروف</h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات المصروف ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/expenses/${expenseId}`}
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
      >
        <div>
          <label
            htmlFor="edit-expense-description"
            className="mb-2 block text-sm font-medium"
          >
            الوصف
          </label>
          <input
            id="edit-expense-description"
            className={inputClass}
            placeholder="أدخل وصف المصروف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="edit-expense-category"
            className="mb-2 block text-sm font-medium"
          >
            الفئة
          </label>
          <input
            id="edit-expense-category"
            className={inputClass}
            placeholder="مثال: إيجار، رواتب، كهرباء"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="edit-expense-amount"
            className="mb-2 block text-sm font-medium"
          >
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
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="edit-expense-date"
            className="mb-2 block text-sm font-medium"
          >
            تاريخ المصروف
          </label>
          <input
            id="edit-expense-date"
            type="date"
            className={inputClass}
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-100 p-3 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
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
