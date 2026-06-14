import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { formatExpenseAmount, type Expense } from "@/services/expense-service"
import { Button } from "@/view/components/ui/button"

const PAGE_SIZE = 15

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar-SY")
}

type ExpensesTableProps = {
  expenses: Expense[]
  search: string
  onSearchChange: (value: string) => void
  isLoading: boolean
  isError: boolean
}

export function ExpensesTable({
  expenses,
  search,
  onSearchChange,
  isLoading,
  isError,
}: ExpensesTableProps) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = expenses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  if (isLoading) {
    return <p className="text-[var(--erp-muted)]">جاري تحميل المصروفات...</p>
  }

  if (isError) {
    return <p className="text-red-500">حدث خطأ أثناء تحميل المصروفات</p>
  }

  return (
    <div className="space-y-4">
      <input
        placeholder="بحث بالوصف أو الفئة..."
        value={search}
        onChange={(e) => {
          onSearchChange(e.target.value)
          setPage(1)
        }}
        className="w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"
      />

      <div className="overflow-x-auto rounded-2xl border bg-[var(--erp-card)]">
        <table className="w-full min-w-[800px] text-right">
          <thead className="bg-[var(--erp-sidebar)]">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">الوصف</th>
              <th className="p-3">الفئة</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="p-3">{expense.id}</td>
                <td className="p-3">{expense.description}</td>
                <td className="p-3">{expense.category}</td>
                <td className="p-3 font-medium">
                  {formatExpenseAmount(expense.amount)}
                </td>
                <td className="p-3">{formatDate(expense.expenseDate)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                      className="text-blue-500"
                    >
                      تعديل
                    </button>
                    <Link
                      to={`/expenses/${expense.id}`}
                      className="text-green-500"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-[var(--erp-muted)]"
                >
                  لا توجد مصروفات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={currentPage === 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
        >
          السابق
        </button>
        <span className="text-sm text-[var(--erp-muted)]">
          صفحة {currentPage} من {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl border px-4 py-2 disabled:opacity-50"
        >
          التالي
        </button>
      </div>

      <div>
        <Button onClick={() => navigate("/expenses/create")}>
          إضافة مصروف جديد
        </Button>
      </div>
    </div>
  )
}
