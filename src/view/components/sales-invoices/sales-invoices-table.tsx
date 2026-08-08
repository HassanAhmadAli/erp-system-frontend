import { useState } from "react"
import { Ban, CheckCircle2, Eye, Loader2, Undo2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
  normalizeSalesInvoiceStatus,
  NumberText,
  salesInvoiceStatusLabels,
  SalesInvoiceStatusBadge,
} from "./sales-invoice-format"

type SalesInvoicesTableProps = {
  invoices: SalesInvoice[]
  isLoading: boolean
  isError: boolean
}

function getSalesInvoiceCustomerName(invoice: SalesInvoice) {
  const fullName = invoice.customer?.user?.fullName?.trim()

  if (fullName) {
    return fullName
  }

  const customerId = invoice.customerId ?? invoice.customer?.id

  if (!customerId) {
    return "عميل نقدي"
  }

  return `عميل #${formatNumber(customerId)}`
}

function getStatusActionLabel(status: SalesInvoiceStatus) {
  return salesInvoiceStatusLabels[status] ?? status
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
      setStatusError("رقم الفاتورة غير صالح.")
      return
    }

    if (!isSalesInvoiceStatus(status)) {
      setStatusError("حالة الفاتورة غير صالحة.")
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
          setStatusError(
            "فشل تحديث حالة الفاتورة. تأكد أن الانتقال مسموح (قيد الانتظار → مكتملة/ملغاة، مكتملة → مستردة)."
          )
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-[var(--erp-muted)]">
        <Loader2 className="size-5 animate-spin" />
        جاري تحميل الفواتير...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
        لم يتم تحميل فواتير المبيعات. غالباً الحساب الحالي لا يملك صلاحية
        الكاشير أو المحاسب، أو أن السيرفر غير مشغل.
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--erp-muted)]">
        لا توجد فواتير مبيعات حالياً.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-right text-sm">
          <thead>
            <tr className="text-xs text-[var(--erp-muted)]">
              <th className="px-4 py-2 font-semibold">رقم الفاتورة</th>
              <th className="px-4 py-2 font-semibold">العميل</th>
              <th className="px-4 py-2 font-semibold">الحالة الحالية</th>
              <th className="px-4 py-2 font-semibold">الإجمالي</th>
              <th className="px-4 py-2 font-semibold">التاريخ</th>
              <th className="px-4 py-2 font-semibold">تحديث الحالة</th>
              <th className="px-4 py-2 font-semibold">الإجراءات</th>
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
                  <td className="rounded-r-2xl bg-[var(--erp-bg)] px-4 py-3 font-semibold">
                    <NumberText value={`#${formatNumber(invoice.id)}`} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {getSalesInvoiceCustomerName(invoice)}
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
                        لا تملك صلاحية التحديث
                      </span>
                    ) : nextStatuses.length === 0 ? (
                      <span className="text-xs text-[var(--erp-muted)]">
                        لا يوجد انتقال متاح
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
                              {getStatusActionLabel(nextStatus)}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </td>

                  <td className="rounded-l-2xl bg-[var(--erp-bg)] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/sales-invoices/${invoice.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-[var(--erp-nav-active-bg)]"
                    >
                      <Eye className="size-4" />
                      عرض
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
          {statusError ||
            "فشل تحديث حالة الفاتورة. الحالة تنتقل من قيد الانتظار إلى مكتملة أو ملغاة، ومن مكتملة إلى مستردة."}
        </p>
      )}
    </>
  )
}
