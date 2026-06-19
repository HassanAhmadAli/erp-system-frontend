import { Link } from "react-router-dom"
import { useMemo, useState } from "react"
import { FolderOpen, Receipt, Wallet } from "lucide-react"

import { useExpenses } from "@/hooks/Expenses/useExpenses"
import {
  formatExpenseAmount,
  sumExpenseAmounts,
} from "@/services/expense-service"
import { ExpensesTable } from "@/view/components/expenses/ExpensesTable"
import { Button } from "@/view/components/ui/button"

export function ExpensesPage() {
  const { data: expenses = [], isLoading, isError } = useExpenses()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return expenses

    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
    )
  }, [expenses, search])

  const totalAmount = sumExpenseAmounts(expenses)
  const filteredTotal = sumExpenseAmounts(filtered)
  const categoryCount = new Set(expenses.map((expense) => expense.category))
    .size
  const isFiltered = search.trim().length > 0

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">المصروفات</h1>
          <p className="mt-1 text-[var(--erp-muted)]">
            إدارة وتتبع مصروفات المتجر
          </p>
        </div>
        <Link to="/expenses/create">
          <Button>إضافة مصروف</Button>
        </Link>
      </div>

      {!isLoading && !isError && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="إجمالي المصروفات"
            value={formatExpenseAmount(totalAmount)}
            hint={
              isFiltered
                ? `المعروض بعد البحث: ${formatExpenseAmount(filteredTotal)}`
                : `مجموع ${expenses.length} مصروف`
            }
            icon={<Wallet className="size-5" />}
          />
          <SummaryCard
            label="عدد المصروفات"
            value={
              isFiltered
                ? `${filtered.length} / ${expenses.length}`
                : expenses.length
            }
            hint={isFiltered ? "معروض / الإجمالي" : undefined}
            icon={<Receipt className="size-5" />}
          />
          <SummaryCard
            label="عدد الفئات"
            value={categoryCount}
            icon={<FolderOpen className="size-5" />}
          />
        </section>
      )}

      <ExpensesTable
        expenses={filtered}
        search={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string | number
  hint?: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[var(--erp-brand)]">{icon}</span>
        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--erp-muted)]">{hint}</p>}
    </div>
  )
}
