import { type FormEvent, useEffect, useState } from "react"
import { ArrowRight, Receipt } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

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
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: ExpenseFormValues = {
  description: "",
  descriptionAr: "",
  category: "",
  categoryAr: "",
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
  const { t } = useTranslation(["common", "pages"])
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
      descriptionAr: expense.descriptionAr ?? "",
      category: expense.category ?? "",
      categoryAr: expense.categoryAr ?? "",
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
      setErrorMessage(t("expenses.invalidExpenseIdShort", { ns: "pages" }))
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
      setErrorMessage(t("expenses.updateFailed", { ns: "pages" }))
    }
  }

  if (!isValidId(expenseId)) {
    return (
      <ErrorMessage
        message={t("expenses.invalidExpenseId", { ns: "pages" })}
        backLabel={t("expenses.backToExpenses", { ns: "pages" })}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-[var(--erp-muted)]">
          {t("expenses.loadingExpense", { ns: "pages" })}
        </p>
      </div>
    )
  }

  if (isError || !expense) {
    return (
      <ErrorMessage
        message={t("expenses.loadExpenseFailed", { ns: "pages" })}
        backLabel={t("expenses.backToExpenses", { ns: "pages" })}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("expenses.editTitle", {
                ns: "pages",
                id: formatId(expenseId),
              })}
            </h1>

            <Receipt className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("expenses.editSubtitle", { ns: "pages" })}
          </p>
        </div>

        <Link
          to={`/expenses/${expenseId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("backToDetails")}
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="edit-expense-description" className={labelClass}>
              {t("description")}
            </label>

            <input
              id="edit-expense-description"
              className={inputClass}
              placeholder={t("expenses.descriptionPlaceholder", {
                ns: "pages",
              })}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
            <ErrorText message={errors.description} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-expense-description-ar" className={labelClass}>
              {t("descriptionAr")}
            </label>

            <input
              id="edit-expense-description-ar"
              className={inputClass}
              value={form.descriptionAr ?? ""}
              onChange={(event) =>
                setField("descriptionAr", event.target.value)
              }
            />
            <ErrorText message={errors.descriptionAr} />
          </div>

          <div>
            <label htmlFor="edit-expense-category" className={labelClass}>
              {t("expenses.expenseCategory", { ns: "pages" })}
            </label>

            <input
              id="edit-expense-category"
              className={inputClass}
              placeholder={t("expenses.categoryPlaceholder", { ns: "pages" })}
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
            />
            <ErrorText message={errors.category} />
          </div>

          <div>
            <label htmlFor="edit-expense-category-ar" className={labelClass}>
              {t("categoryAr")}
            </label>

            <input
              id="edit-expense-category-ar"
              className={inputClass}
              value={form.categoryAr ?? ""}
              onChange={(event) => setField("categoryAr", event.target.value)}
            />
            <ErrorText message={errors.categoryAr} />
          </div>

          <div>
            <label htmlFor="edit-expense-amount" className={labelClass}>
              {t("amount")}
            </label>

            <input
              id="edit-expense-amount"
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              placeholder={t("expenses.amountPlaceholder", { ns: "pages" })}
              value={form.amount}
              onChange={(event) => setField("amount", event.target.value)}
            />
            <ErrorText message={errors.amount} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="edit-expense-date" className={labelClass}>
              {t("expenses.expenseDate", { ns: "pages" })}
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
            {updateMutation.isPending ? t("saving") : t("saveChanges")}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/expenses/${expenseId}`)}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  )
}

function ErrorMessage({
  message,
  backLabel,
}: {
  message: string
  backLabel: string
}) {
  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/expenses"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        <ArrowRight className="size-4" />
        {backLabel}
      </Link>
    </div>
  )
}
