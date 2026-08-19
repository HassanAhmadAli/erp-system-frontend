import { useState } from "react"
import { Ban, CheckCircle2, Eye, Loader2, Undo2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { useUpdateSalesInvoiceStatus } from "@/hooks/useSalesInvoices"
import { usePermissions } from "@/hooks/usePermissions"
import { isValidId } from "@/validation/helpers"
import { isSalesInvoiceStatus } from "@/validation/sales-invoice-schema"
import type {
  SalesInvoice,
  SalesInvoiceStatus,
} from "@/services/sales-invoices-service"
import {
  formatDate,
  formatMoney,
  formatNumber,
  getInvoiceTotal,
  getNextSalesInvoiceStatusOptions,
  getSalesInvoiceStatusLabel,
  normalizeSalesInvoiceStatus,
  NumberText,
  SalesInvoiceStatusBadge,
} from "./sales-invoice-format"

type SalesInvoicesTableProps = {
  invoices: SalesInvoice[]
  isLoading: boolean
  isError: boolean
}

function getSalesInvoiceCustomerName(
  invoice: SalesInvoice,
  t: ReturnType<typeof useTranslation>["t"]
) {
  const fullName = invoice.customer?.user?.fullName?.trim()

  if (fullName) {
    return fullName
  }

  const customerId = invoice.customerId ?? invoice.customer?.id

  if (!customerId) {
    return t("common:cashCustomerLabel")
  }

  return t("common:customerFallback", { id: formatNumber(customerId) })
}

function getStatusActionIcon(status: SalesInvoiceStatus) {
  if (status === "COMPLETED") return CheckCircle2
  if (status === "REFUNDED") return Undo2
  return Ban
}

function getStatusActionClass(status: SalesInvoiceStatus) {
  if (status === "COMPLETED") {
    return "bg-emerald-600 text-white hover:bg-emerald-700"
  }

  if (status === "REFUNDED") {
    return "bg-rose-600 text-white hover:bg-rose-700"
  }

  return "bg-red-600 text-white hover:bg-red-700"
}

export function SalesInvoicesTable({
  invoices,
  isLoading,
  isError,
}: SalesInvoicesTableProps) {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { canManageSalesInvoice } = usePermissions()
  const updateStatusMutation = useUpdateSalesInvoiceStatus()
  const [statusError, setStatusError] = useState("")
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<number | null>(
    null
  )

  function handleStatusUpdate(id: number, status: SalesInvoiceStatus) {
    setStatusError("")

    if (!isValidId(id)) {
      setStatusError(t("pages:salesInvoices.invalidInvoiceId"))
      return
    }

    if (!isSalesInvoiceStatus(status)) {
      setStatusError(t("pages:salesInvoices.invalidInvoiceStatus"))
      return
    }

    setUpdatingInvoiceId(id)
    updateStatusMutation.mutate(
      { id, status },
      {
        onSettled: () => {
          setUpdatingInvoiceId(null)
        },
        onError: () => {
          setStatusError(t("pages:salesInvoices.statusUpdateFailedTransition"))
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-[var(--erp-muted)]">
        <Loader2 className="size-5 animate-spin" />
        {t("pages:salesInvoices.loadingList")}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
        {t("pages:salesInvoices.loadListFailed")}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--erp-muted)]">
        {t("pages:salesInvoices.noInvoices")}
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-start text-sm">
          <thead>
            <tr className="text-xs text-[var(--erp-muted)]">
              <th className="px-4 py-2 font-semibold">
                {t("common:invoiceNumber")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("common:customer")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("common:currentStatus")}
              </th>
              <th className="px-4 py-2 font-semibold">{t("common:total")}</th>
              <th className="px-4 py-2 font-semibold">{t("common:date")}</th>
              <th className="px-4 py-2 font-semibold">
                {t("common:updateStatus")}
              </th>
              <th className="px-4 py-2 font-semibold">{t("common:actions")}</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => {
              const currentStatus = normalizeSalesInvoiceStatus(invoice.status)
              const nextStatuses =
                getNextSalesInvoiceStatusOptions(currentStatus)
              const canUpdate = canManageSalesInvoice(invoice)
              const isRowUpdating =
                updateStatusMutation.isPending &&
                updatingInvoiceId === invoice.id

              return (
                <tr key={invoice.id}>
                  <td className="rounded-s-2xl bg-[var(--erp-bg)] px-4 py-3 font-semibold">
                    <NumberText value={`#${formatNumber(invoice.id)}`} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {getSalesInvoiceCustomerName(invoice, t)}
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <SalesInvoiceStatusBadge status={currentStatus} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText value={formatDate(invoice.createdAt)} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {!canUpdate ? (
                      <span className="text-xs text-[var(--erp-muted)]">
                        {t("common:noPermission")}
                      </span>
                    ) : nextStatuses.length === 0 ? (
                      <span className="text-xs text-[var(--erp-muted)]">
                        {t("pages:salesInvoices.noStatusTransition")}
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((nextStatus) => {
                          const Icon = getStatusActionIcon(nextStatus)

                          return (
                            <button
                              key={nextStatus}
                              type="button"
                              disabled={updateStatusMutation.isPending}
                              onClick={() =>
                                handleStatusUpdate(invoice.id, nextStatus)
                              }
                              className={cn(
                                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                                getStatusActionClass(nextStatus),
                                "disabled:cursor-not-allowed disabled:opacity-60"
                              )}
                            >
                              {isRowUpdating ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Icon className="size-4" />
                              )}
                              {getSalesInvoiceStatusLabel(nextStatus, t)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </td>

                  <td className="rounded-e-2xl bg-[var(--erp-bg)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/sales-invoices/${invoice.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-[var(--erp-nav-active-bg)]"
                    >
                      <Eye className="size-4" />
                      {t("common:view")}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {(updateStatusMutation.isError || statusError) && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {statusError || t("pages:salesInvoices.statusUpdateFailedRules")}
        </p>
      )}
    </>
  )
}
