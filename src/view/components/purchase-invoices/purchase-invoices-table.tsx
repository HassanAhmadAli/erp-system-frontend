import { useState } from "react"
import { Ban, CheckCircle2, Eye, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { useUpdatePurchaseInvoiceStatus } from "@/hooks/usePurchaseInvoices"
import { isValidId } from "@/validation/helpers"
import { isPurchaseInvoiceStatus } from "@/validation/purchase-invoice-schema"
import type {
  PurchaseInvoice,
  PurchaseInvoiceStatus,
} from "@/services/purchase-invoices-service"
import {
  formatDate,
  formatMoney,
  formatNumber,
  getInvoiceTotal,
  getPurchaseInvoiceStatusLabel,
  getSupplierName,
  NumberText,
  PurchaseInvoiceStatusBadge,
} from "./purchase-invoice-format"

type PurchaseInvoicesTableProps = {
  invoices: PurchaseInvoice[]
  isLoading: boolean
  isError: boolean
}

export function PurchaseInvoicesTable({
  invoices,
  isLoading,
  isError,
}: PurchaseInvoicesTableProps) {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const updateStatusMutation = useUpdatePurchaseInvoiceStatus()
  const [statusError, setStatusError] = useState("")

  function handleStatusUpdate(id: number, status: PurchaseInvoiceStatus) {
    setStatusError("")

    if (!isValidId(id)) {
      setStatusError(t("pages:purchaseInvoices.invalidInvoiceId"))
      return
    }

    if (!isPurchaseInvoiceStatus(status)) {
      setStatusError(t("pages:purchaseInvoices.invalidInvoiceStatus"))
      return
    }

    updateStatusMutation.mutate({ id, status })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-[var(--erp-muted)]">
        <Loader2 className="size-5 animate-spin" />
        {t("pages:purchaseInvoices.loadingList")}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
        {t("pages:purchaseInvoices.loadListFailed")}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--erp-muted)]">
        {t("pages:purchaseInvoices.noInvoices")}
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-separate border-spacing-y-2 text-start text-sm">
          <thead>
            <tr className="text-xs text-[var(--erp-muted)]">
              <th className="px-4 py-2 font-semibold">
                {t("common:invoiceNumber")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("common:supplier")}
              </th>
              <th className="px-4 py-2 font-semibold">{t("common:status")}</th>
              <th className="px-4 py-2 font-semibold">{t("common:total")}</th>
              <th className="px-4 py-2 font-semibold">
                {t("common:invoiceDate")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("common:updateStatus")}
              </th>
              <th className="px-4 py-2 font-semibold">{t("common:actions")}</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => {
              const currentStatus = String(
                invoice.status ?? "PENDING"
              ).toUpperCase()

              const canEditStatus = currentStatus === "PENDING"

              return (
                <tr key={invoice.id}>
                  <td className="rounded-s-2xl bg-[var(--erp-bg)] px-4 py-3 font-semibold">
                    <NumberText value={`#${formatNumber(invoice.id)}`} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {getSupplierName(invoice, t)}
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <PurchaseInvoiceStatusBadge status={currentStatus} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText
                      value={formatDate(
                        invoice.invoiceDate ?? invoice.createdAt
                      )}
                    />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {canEditStatus ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            handleStatusUpdate(
                              invoice.id,
                              "COMPLETED" as PurchaseInvoiceStatus
                            )
                          }
                          className={cn(
                            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                            "bg-emerald-600 text-white hover:bg-emerald-700",
                            "disabled:cursor-not-allowed disabled:opacity-60"
                          )}
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          {getPurchaseInvoiceStatusLabel("COMPLETED", t)}
                        </button>

                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            handleStatusUpdate(
                              invoice.id,
                              "CANCELLED" as PurchaseInvoiceStatus
                            )
                          }
                          className={cn(
                            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                            "bg-red-600 text-white hover:bg-red-700",
                            "disabled:cursor-not-allowed disabled:opacity-60"
                          )}
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Ban className="size-4" />
                          )}
                          {getPurchaseInvoiceStatusLabel("CANCELLED", t)}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--erp-muted)]">
                        {t("pages:purchaseInvoices.cannotEditStatus")}
                      </span>
                    )}
                  </td>

                  <td className="rounded-e-2xl bg-[var(--erp-bg)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/purchase-invoices/${invoice.id}`)
                      }
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

      {updateStatusMutation.isError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {t("pages:purchaseInvoices.statusUpdateFailedRules")}
        </p>
      )}

      {statusError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {statusError}
        </p>
      )}
    </>
  )
}
