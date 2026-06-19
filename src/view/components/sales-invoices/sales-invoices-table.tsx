import { CheckCircle2, Eye, Loader2, Undo2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useUpdateSalesInvoiceStatus } from "@/hooks/useSalesInvoices"
import type {
  SalesInvoice,
  SalesInvoiceStatus,
} from "@/services/sales-invoices-service"
import {
  formatDate,
  formatMoney,
  formatNumber,
  getCustomerName,
  getInvoiceTotal,
  NumberText,
  SalesInvoiceStatusBadge,
} from "./sales-invoice-format"

type SalesInvoicesTableProps = {
  invoices: SalesInvoice[]
  isLoading: boolean
  isError: boolean
}

export function SalesInvoicesTable({
  invoices,
  isLoading,
  isError,
}: SalesInvoicesTableProps) {
  const navigate = useNavigate()
  const updateStatusMutation = useUpdateSalesInvoiceStatus()

  function handleStatusUpdate(id: number, status: SalesInvoiceStatus) {
    updateStatusMutation.mutate({ id, status })
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
        <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-right text-sm">
          <thead>
            <tr className="text-xs text-[var(--erp-muted)]">
              <th className="px-4 py-2 font-semibold">رقم الفاتورة</th>
              <th className="px-4 py-2 font-semibold">العميل</th>
              <th className="px-4 py-2 font-semibold">الحالة</th>
              <th className="px-4 py-2 font-semibold">الإجمالي</th>
              <th className="px-4 py-2 font-semibold">المدفوع</th>
              <th className="px-4 py-2 font-semibold">التاريخ</th>
              <th className="px-4 py-2 font-semibold">تحديث الحالة</th>
              <th className="px-4 py-2 font-semibold">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => {
              const currentStatus = String(
                invoice.status ?? "PENDING"
              ).toUpperCase()

              const canComplete = currentStatus === "PENDING"
              const canReturn = currentStatus === "COMPLETED"

              return (
                <tr key={invoice.id}>
                  <td className="rounded-r-2xl bg-[var(--erp-bg)] px-4 py-3 font-semibold">
                    <NumberText value={`#${formatNumber(invoice.id)}`} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {getCustomerName(invoice)}
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <SalesInvoiceStatusBadge status={currentStatus} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText value={formatMoney(invoice.amountPaid)} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    <NumberText value={formatDate(invoice.createdAt)} />
                  </td>

                  <td className="bg-[var(--erp-bg)] px-4 py-3">
                    {canComplete && (
                      <button
                        type="button"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          handleStatusUpdate(
                            invoice.id,
                            "COMPLETED" as SalesInvoiceStatus
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
                        Complete
                      </button>
                    )}

                    {canReturn && (
                      <button
                        type="button"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          handleStatusUpdate(
                            invoice.id,
                            "REFUNDED" as SalesInvoiceStatus
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
                          <Undo2 className="size-4" />
                        )}
                        Returned
                      </button>
                    )}

                    {!canComplete && !canReturn && (
                      <span className="text-xs text-[var(--erp-muted)]">
                        لا يوجد انتقال متاح
                      </span>
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

      {updateStatusMutation.isError && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          فشل تحديث حالة الفاتورة. الحالة يجب أن تنتقل من Pending إلى Completed
          ثم إلى Returned.
        </p>
      )}
    </>
  )
}
