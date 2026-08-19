import { useState } from "react"
import { ArrowRight, Percent } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useDiscountById } from "@/hooks/use-discounts"
import { deleteDiscount, toggleDiscount } from "@/services/discount-service"
import { isValidId } from "@/validation/helpers"
import {
  formatDiscountValue,
  getDiscountScopeLabel,
  getDiscountTypeLabel,
} from "@/lib/discount-labels"
import {
  formatId,
  formatNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"

function formatLocalDate(value: string | null, t: (key: string) => string) {
  if (!value) return t("common:none")

  return toEnglishDigits(
    new Date(value).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  )
}

export function DiscountDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const params = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const id = Number(params.id)

  const [actionError, setActionError] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error } = useDiscountById(id)

  async function handleToggle() {
    if (!data) return

    try {
      setActionError("")
      await toggleDiscount(data.id, !data.isActive)
      queryClient.invalidateQueries({ queryKey: ["discount", data.id] })
      queryClient.invalidateQueries({ queryKey: ["discounts"] })
    } catch (err) {
      console.error(err)
      setActionError(t("pages:discounts.toggleFailed"))
    }
  }

  async function handleDelete() {
    if (!data) return

    try {
      setIsDeleting(true)
      setActionError("")
      await deleteDiscount(data.id)
      navigate("/discounts")
    } catch (err) {
      console.error(err)
      setActionError(t("pages:discounts.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isValidId(id)) {
    return <ErrorMessage message={t("pages:discounts.invalidDiscountId")} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-[var(--erp-muted)]">
          {t("pages:discounts.loadingDetails")}
        </p>
      </div>
    )
  }

  if (error || !data) {
    return <ErrorMessage message={t("pages:discounts.loadDetailsFailed")} />
  }

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {data.name}
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:discounts.detailsSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/discounts/${data.id}/edit`}>
            <Button>{t("pages:discounts.editDiscount")}</Button>
          </Link>

          <Link
            to="/discounts"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            {t("pages:discounts.backToDiscounts")}
          </Link>
        </div>
      </header>

      {actionError && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {actionError}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label={t("common:discountId")} value={formatId(data.id)} />
        <SummaryCard
          label={t("common:type")}
          value={getDiscountTypeLabel(data.type, t)}
        />
        <SummaryCard
          label={t("common:scope")}
          value={getDiscountScopeLabel(data.scope, t)}
        />
        <SummaryCard
          label={t("common:value")}
          value={formatDiscountValue(data.type, data.value)}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 className="mb-5 text-xl font-semibold text-[var(--erp-text)]">
          {t("pages:discounts.discountInfo")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label={t("common:status")}
            value={
              data.isActive
                ? t("common:enabledLabel")
                : t("common:disabledLabel")
            }
          />
          <InfoRow
            label={t("common:usageCount")}
            value={formatNumber(data.usedCount)}
          />

          <InfoRow
            label={t("common:maxUsageLimit")}
            value={
              data.maxUses ? formatNumber(data.maxUses) : t("common:unlimited")
            }
          />

          <InfoRow
            label={t("common:maxInvoiceValueLabel")}
            value={
              data.maxInvoiceValue
                ? `${formatNumber(data.maxInvoiceValue)} SYP`
                : t("common:unlimited")
            }
          />

          <InfoRow
            label={t("common:startDate")}
            value={formatLocalDate(data.startDate, t)}
          />

          <InfoRow
            label={t("common:endDate")}
            value={formatLocalDate(data.endDate, t)}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--erp-border)] pt-4">
          <Button
            variant={data.isActive ? "destructive" : "success"}
            onClick={handleToggle}
          >
            {data.isActive
              ? t("pages:discounts.disableDiscount")
              : t("pages:discounts.enableDiscount")}
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            {t("pages:discounts.deleteDiscount")}
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={showDeleteDialog}
        title={t("pages:discounts.confirmDeleteTitle")}
        description={t("pages:discounts.confirmDeleteDesc")}
        confirmLabel={t("common:delete")}
        cancelLabel={t("common:cancel")}
        isLoading={isDeleting}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-1 font-medium text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/discounts"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        {t("pages:discounts.backToDiscounts")}
      </Link>
    </div>
  )
}
