import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Loader2,
  ReceiptText,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { apiRequest } from "@/api/client"
import { isValidId } from "@/validation/helpers"
import {
  isPurchaseInvoiceStatus,
  type PurchaseInvoiceStatus,
} from "@/validation/purchase-invoice-schema"
import {
  formatDate,
  formatMoney,
  formatNumber,
  getInvoiceTotal,
  getSupplierName,
  NumberText,
  PurchaseInvoiceStatusBadge,
} from "@/view/components/purchase-invoices/purchase-invoice-format"
import type { PurchaseInvoice } from "@/services/purchase-invoices-service"

const PURCHASE_INVOICES_ENDPOINT = "/purchase/invoices"

function getPurchaseInvoice(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid purchase invoice id")
  }

  return apiRequest<PurchaseInvoice>(`${PURCHASE_INVOICES_ENDPOINT}/${id}`)
}

function updatePurchaseInvoiceStatus(
  id: number,
  status: PurchaseInvoiceStatus
) {
  if (!isValidId(id)) {
    throw new Error("Invalid purchase invoice id")
  }

  if (!isPurchaseInvoiceStatus(status)) {
    throw new Error("Invalid purchase invoice status")
  }

  return apiRequest<PurchaseInvoice>(
    `${PURCHASE_INVOICES_ENDPOINT}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}

export function PurchaseInvoiceDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()

  const invoiceId = Number(id)
  const [statusError, setStatusError] = useState("")

  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchase-invoice", invoiceId],
    queryFn: () => getPurchaseInvoice(invoiceId),
    enabled: isValidId(invoiceId),
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: PurchaseInvoiceStatus) =>
      updatePurchaseInvoiceStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchase-invoice", invoiceId],
      })
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] })
    },
  })

  function handleComplete() {
    setStatusError("")

    if (!isValidId(invoiceId)) {
      setStatusError(t("pages:purchaseInvoices.invalidInvoiceId"))
      return
    }

    if (!isPurchaseInvoiceStatus("COMPLETED")) {
      setStatusError(t("pages:purchaseInvoices.invalidInvoiceStatus"))
      return
    }

    updateStatusMutation.mutate("COMPLETED")
  }

  function handleCancel() {
    setStatusError("")

    if (!isValidId(invoiceId)) {
      setStatusError(t("pages:purchaseInvoices.invalidInvoiceId"))
      return
    }

    if (!isPurchaseInvoiceStatus("CANCELLED")) {
      setStatusError(t("pages:purchaseInvoices.invalidInvoiceStatus"))
      return
    }

    updateStatusMutation.mutate("CANCELLED")
  }

  if (!isValidId(invoiceId)) {
    return (
      <main className="space-y-6">
        <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-red-600">
            {t("pages:purchaseInvoices.invalidInvoiceId")}
          </p>
          <button
            type="button"
            onClick={() => navigate("/purchase-invoices")}
            className="mt-4 rounded-2xl border px-4 py-2 text-sm"
          >
            {t("common:backToInvoices")}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />
            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:purchaseInvoices.detailsTitle")}{" "}
              <NumberText value={`#${formatNumber(invoiceId)}`} />
            </h1>
          </div>
          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:purchaseInvoices.detailsSubtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchase-invoices")}
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition hover:bg-[var(--erp-nav-active-bg)]"
        >
          <ArrowRight className="size-4 ltr:rotate-180" />
          {t("pages:purchaseInvoices.backToList")}
        </button>
      </section>

      {isLoading && (
        <section className="rounded-[24px] bg-[var(--erp-card)] p-10 shadow-[var(--erp-shadow)]">
          <div className="flex items-center justify-center gap-2 text-[var(--erp-muted)]">
            <Loader2 className="size-5 animate-spin" />
            {t("pages:purchaseInvoices.loadingDetails")}
          </div>
        </section>
      )}

      {isError && (
        <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {t("pages:purchaseInvoices.loadDetailsFailed")}
          </div>
        </section>
      )}

      {invoice && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">
                {t("common:status")}
              </p>
              <div className="mt-2">
                <PurchaseInvoiceStatusBadge status={invoice.status} />
              </div>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">
                {t("common:supplier")}
              </p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                {getSupplierName(invoice, t)}
              </p>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">
                {t("common:total")}
              </p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
              </p>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">
                {t("common:paidAmount")}
              </p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                <NumberText value={formatMoney(invoice.amountPaid)} />
              </p>
            </div>
          </section>

          <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="text-start">
                <h2 className="text-lg font-bold text-[var(--erp-text)]">
                  {t("pages:purchaseInvoices.invoiceInfo")}
                </h2>
                <p className="mt-1 text-sm text-[var(--erp-muted)]">
                  {t("pages:purchaseInvoices.invoiceInfoHint")}
                </p>
              </div>

              {invoice.status === "PENDING" && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={handleComplete}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {t("pages:purchaseInvoices.completeInvoice")}
                  </button>

                  <button
                    type="button"
                    disabled={updateStatusMutation.isPending}
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Ban className="size-4" />
                    )}
                    {t("pages:purchaseInvoices.cancelInvoice")}
                  </button>
                </div>
              )}
            </div>

            {updateStatusMutation.isError && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {t("pages:purchaseInvoices.statusUpdateFailed")}
              </p>
            )}

            {statusError && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {statusError}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:supplierId")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText
                    value={formatNumber(
                      invoice.supplierId ?? invoice.supplier?.id
                    )}
                  />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:accountantId")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatNumber(invoice.accountantId)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:warehouseWorkerId")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatNumber(invoice.warehouseWorkerId)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:subtotal")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatMoney(invoice.subtotal)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:remainingAmount")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatMoney(invoice.remainingAmount)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:total")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:createdAt")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatDate(invoice.createdAt)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  {t("common:updatedAt")}
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatDate(invoice.updatedAt)} />
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
            <h2 className="mb-4 text-lg font-bold text-[var(--erp-text)]">
              {t("pages:purchaseInvoices.invoiceProducts")}
            </h2>

            {!invoice.items || invoice.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--erp-muted)]">
                {t("pages:purchaseInvoices.noInvoiceProducts")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-start text-sm">
                  <thead>
                    <tr className="border-b text-xs text-[var(--erp-muted)]">
                      <th className="px-3 py-2">{t("common:productId")}</th>
                      <th className="px-3 py-2">{t("common:productName")}</th>
                      <th className="px-3 py-2">{t("common:quantity")}</th>
                      <th className="px-3 py-2">{t("common:unitPrice")}</th>
                      <th className="px-3 py-2">{t("common:total")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id ?? `${item.productId}-${index}`}>
                        <td className="border-b px-3 py-3">
                          <NumberText
                            value={`#${formatNumber(item.productId)}`}
                          />
                        </td>

                        <td className="border-b px-3 py-3">
                          {item.product?.name ||
                            item.product?.title ||
                            t("common:notAvailable")}
                        </td>

                        <td className="border-b px-3 py-3">
                          <NumberText value={formatNumber(item.quantity)} />
                        </td>

                        <td className="border-b px-3 py-3">
                          <NumberText
                            value={formatMoney(
                              item.unitPrice ??
                                item.product?.purchasePrice ??
                                item.product?.costPrice ??
                                item.product?.buyingPrice ??
                                item.product?.price
                            )}
                          />
                        </td>

                        <td className="border-b px-3 py-3">
                          <NumberText value={formatMoney(item.totalPrice)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}
