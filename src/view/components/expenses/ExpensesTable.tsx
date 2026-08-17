import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { formatExpenseAmount, type Expense } from "@/services/expense-service"
import { PERMISSIONS } from "@/auth/permissions"
import { useLocale } from "@/i18n/locale-provider"
import { localized, localizedDescription } from "@/lib/localized"
import { Can } from "@/view/components/auth/can"
import {
  formatId,
  formatNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

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
  page: number
  isFinalPage: boolean
  isFetching?: boolean
  total?: number
  onPrevious: () => void
  onNext: () => void
}

export function ExpensesTable({
  expenses,
  search,
  onSearchChange,
  isLoading,
  isError,
  page,
  isFinalPage,
  isFetching = false,
  total,
  onPrevious,
  onNext,
}: ExpensesTableProps) {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { language } = useLocale()

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        {t("expenses.loadingExpenses", { ns: "pages" })}
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        {t("expenses.loadExpensesFailed", { ns: "pages" })}
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("expenses.expenseList", { ns: "pages" })}
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {total != null
              ? t("resultCountTotal", {
                  count: formatNumber(expenses.length),
                  total: formatNumber(total),
                })
              : t("resultCount", {
                  count: formatNumber(expenses.length),
                })}
          </p>
        </div>

        <input
          placeholder={t("expenses.searchPlaceholder", { ns: "pages" })}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20 md:max-w-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
        <table className="w-full min-w-[800px] table-fixed text-start text-sm">
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
              <th className="px-3 py-3 font-medium">{t("description")}</th>
              <th className="px-3 py-3 font-medium">
                {t("expenses.expenseCategory", { ns: "pages" })}
              </th>
              <th className="px-3 py-3 font-medium">{t("amount")}</th>
              <th className="px-3 py-3 font-medium">{t("date")}</th>
              <th className="px-3 py-3 text-center font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
              >
                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  {formatId(expense.id)}
                </td>

                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  <span className="block truncate">
                    {localizedDescription(expense, language)}
                  </span>
                </td>

                <td className="px-3 py-3 text-[var(--erp-muted)]">
                  <span className="block truncate">
                    {localized(expense.category, expense.categoryAr, language)}
                  </span>
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
                        {t("view")}
                      </Button>
                    </Link>

                    <Can permission={PERMISSIONS.EXPENSES_MANAGE}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                      >
                        {t("edit")}
                      </Button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}

            {expenses.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-[var(--erp-muted)]"
                >
                  {t("expenses.noExpenses", { ns: "pages" })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        isFinalPage={isFinalPage}
        isLoading={isFetching}
        total={total}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </section>
  )
}
