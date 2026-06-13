import { ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

import { useCreateExpense } from "@/hooks/Expenses/useExpenses"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"

export function CreateExpensePage() {
  const navigate = useNavigate()
  const createMutation = useCreateExpense()

  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [errorMessage, setErrorMessage] = useState("")

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
      await createMutation.mutateAsync({
        description,
        category,
        amount: Number(amount),
        expenseDate,
      })
      navigate("/expenses")
    } catch {
      setErrorMessage("فشل إنشاء المصروف، حاول مرة أخرى")
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">إضافة مصروف</h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أدخل بيانات المصروف ثم اضغط حفظ.
          </p>
        </div>

        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى المصروفات
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
      >
        <div>
          <label
            htmlFor="expense-description"
            className="mb-2 block text-sm font-medium"
          >
            الوصف
          </label>
          <input
            id="expense-description"
            className={inputClass}
            placeholder="أدخل وصف المصروف"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="expense-category"
            className="mb-2 block text-sm font-medium"
          >
            الفئة
          </label>
          <input
            id="expense-category"
            className={inputClass}
            placeholder="مثال: إيجار، رواتب، كهرباء"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="expense-amount"
            className="mb-2 block text-sm font-medium"
          >
            المبلغ
          </label>
          <input
            id="expense-amount"
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
            htmlFor="expense-date"
            className="mb-2 block text-sm font-medium"
          >
            تاريخ المصروف
          </label>
          <input
            id="expense-date"
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
