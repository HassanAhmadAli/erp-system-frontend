import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { FolderOpen, Plus, Receipt, Wallet } from "lucide-react"

import { useExpenses } from "@/hooks/Expenses/useExpenses"
import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"
import {
  formatExpenseAmount,
  sumExpenseAmounts,
} from "@/services/expense-service"
import { formatNumber, toEnglishDigits } from "@/utils/number-formatters"
import { ExpensesTable } from "@/view/components/expenses/ExpensesTable"
import { Button } from "@/view/components/ui/button"

const PAGE_SIZE = 10

function formatAmount(value: unknown) {
  return `${toEnglishDigits(formatExpenseAmount(value))} SYP`
}

export function ExpensesPage() {
  const { t } = useTranslation(["common", "pages"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useExpenses({
    page,
    limit: PAGE_SIZE,
  })

  useEffect(() => {
    setPage(1)
  }, [search])

  const expenses = data?.data ?? []

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return expenses

    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query)
    )
  }, [expenses, search])

  const pageTotal = sumExpenseAmounts(filtered)
  const categoryCount = new Set(filtered.map((expense) => expense.category))
    .size
  const isFiltered = search.trim().length > 0

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("expenses.title", { ns: "pages" })}
            </h1>

            <Receipt className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("expenses.subtitle", { ns: "pages" })}
          </p>
        </div>

        <Can permission={PERMISSIONS.EXPENSES_MANAGE}>
          <Link to="/expenses/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              {t("expenses.create", { ns: "pages" })}
            </Button>
          </Link>
        </Can>
      </header>

      {!isLoading && !isError && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label={t("expenses.pageTotal", { ns: "pages" })}
            value={formatAmount(pageTotal)}
            hint={
              isFiltered
                ? t("expenses.afterPageSearch", { ns: "pages" })
                : data?.total != null
                  ? t("expenses.ofTotalExpenses", {
                      ns: "pages",
                      total: formatNumber(data.total),
                    })
                  : undefined
            }
            icon={<Wallet className="size-5" />}
          />

          <SummaryCard
            label={t("expenses.expenseCount", { ns: "pages" })}
            value={
              data?.total != null
                ? formatNumber(data.total)
                : formatNumber(filtered.length)
            }
            hint={
              isFiltered
                ? t("shownOnPage", {
                    count: formatNumber(filtered.length),
                  })
                : undefined
            }
            icon={<Receipt className="size-5" />}
          />

          <SummaryCard
            label={t("expenses.categoryCountPage", { ns: "pages" })}
            value={formatNumber(categoryCount)}
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
        page={page}
        isFinalPage={data?.isFinalPage ?? true}
        isFetching={isFetching}
        total={data?.total}
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
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
  icon: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-between">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>

      <p className="mt-3 text-2xl font-bold text-[var(--erp-text)]">{value}</p>

      {hint && <p className="mt-1 text-xs text-[var(--erp-muted)]">{hint}</p>}
    </div>
  )
}
