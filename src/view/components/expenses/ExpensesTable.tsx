import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { formatExpenseAmount, type Expense } from "@/services/expense-service"
import {
  formatId,
  formatNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

const PAGE_SIZE = 15

function formatDate(date: string) {
  return toEnglishDigits(
    new Date(date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  )
}

function formatAmount(amount: unknown) {
  return `${toEnglishDigits(formatExpenseAmount(amount))} SYP`
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
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        جاري تحميل المصروفات...
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        حدث خطأ أثناء تحميل المصروفات
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            قائمة المصروفات
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            عدد النتائج: {formatNumber(expenses.length)}
          </p>
        </div>

        <input
          placeholder="بحث بالوصف أو الفئة..."
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value)
            setPage(1)
          }}
          className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20 md:max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
        <table className="w-full table-fixed text-right text-sm">
          <colgroup>
            <col className="w-[8%]" />
            <col className="w-[25%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[15%]" />
            <col className="w-[16%]" />
          </colgroup>

          <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">#</th>
              <th className="px-3 py-3 font-medium">الوصف</th>
              <th className="px-3 py-3 font-medium">الفئة</th>
              <th className="px-3 py-3 font-medium">المبلغ</th>
              <th className="px-3 py-3 font-medium">التاريخ</th>
              <th className="px-3 py-3 text-center font-medium">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
              >
                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  {formatId(expense.id)}
                </td>

                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  <span className="block truncate">{expense.description}</span>
                </td>

                <td className="px-3 py-3 text-[var(--erp-muted)]">
                  <span className="block truncate">{expense.category}</span>
                </td>

                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  <span className="block truncate">
                    {formatAmount(expense.amount)}
                  </span>
                </td>

                <td className="px-3 py-3 text-[var(--erp-muted)]">
                  {formatDate(expense.expenseDate)}
                </td>

                <td className="px-3 py-3">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Link to={`/expenses/${expense.id}`}>
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                    >
                      تعديل
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-[var(--erp-muted)]"
                >
                  لا توجد مصروفات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setPage((currentValue) => currentValue - 1)}
        >
          السابق
        </Button>

        <span className="text-center text-sm text-[var(--erp-muted)]">
          صفحة {formatNumber(currentPage)} من {formatNumber(totalPages)}
        </span>

        <Button
          type="button"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => setPage((currentValue) => currentValue + 1)}
        >
          التالي
        </Button>
      </div>
    </section>
  )
}
