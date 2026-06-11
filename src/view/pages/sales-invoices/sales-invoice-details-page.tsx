import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Loader2, ReceiptText, Undo2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { apiRequest } from "@/api/client"
import { cn } from "@/lib/utils"

type SalesInvoiceStatus = "PENDING" | "COMPLETED" | "REFUNDED"

type SalesInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitPrice?: string | number
  totalPrice?: string | number
  product?: {
    id: number
    name?: string
    title?: string
    sellingPrice?: string | number
    price?: string | number
  }
}

type SalesInvoice = {
  id: number
  customerId?: number
  discountId?: number | null
  cashierId?: number
  status: SalesInvoiceStatus | string
  amountPaid?: string | number
  totalAmount?: string | number
  finalAmount?: string | number
  subtotal?: string | number
  discountAmount?: string | number
  remainingAmount?: string | number
  createdAt?: string
  updatedAt?: string
  customer?: {
    id: number
    user?: {
      fullName?: string
      email?: string
      phoneNumber?: string
    }
  }
  discount?: {
    id: number
    name?: string
    title?: string
    value?: string | number
    type?: string
  } | null
  items?: SalesInvoiceItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  COMPLETED: "مكتملة",
  REFUNDED: "مستردة",
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REFUNDED: "bg-rose-50 text-rose-700 ring-rose-200",
}

function getSalesInvoice(id: number) {
  return apiRequest<SalesInvoice>(`/sales/invoices/${id}`)
}

function updateSalesInvoiceStatus(id: number, status: SalesInvoiceStatus) {
  return apiRequest<SalesInvoice>(`/sales/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return String(value)
  }

  return `${numberValue.toLocaleString()} ل.س`
}

function formatDate(value?: string) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getCustomerName(invoice: SalesInvoice) {
  return (
    invoice.customer?.user?.fullName ||
    invoice.customer?.user?.email ||
    `عميل #${invoice.customerId ?? "—"}`
  )
}

function getInvoiceTotal(invoice: SalesInvoice) {
  return (
    invoice.finalAmount ??
    invoice.totalAmount ??
    invoice.subtotal ??
    invoice.amountPaid ??
    null
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
        statusStyles[status] ?? "bg-slate-50 text-slate-700 ring-slate-200"
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}

export function SalesInvoiceDetailsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()

  const invoiceId = Number(id)

  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sales-invoice", invoiceId],
    queryFn: () => getSalesInvoice(invoiceId),
    enabled: Number.isFinite(invoiceId) && invoiceId > 0,
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: SalesInvoiceStatus) =>
      updateSalesInvoiceStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoice", invoiceId] })
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
    },
  })

  function handleRefund() {
    updateStatusMutation.mutate("REFUNDED")
  }

  if (!Number.isFinite(invoiceId) || invoiceId <= 0) {
    return (
      <main className="space-y-6" dir="rtl">
        <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-red-600">رقم الفاتورة غير صالح.</p>
          <button
            type="button"
            onClick={() => navigate("/sales-invoices")}
            className="mt-4 rounded-2xl border px-4 py-2 text-sm"
          >
            العودة إلى الفواتير
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />
            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              تفاصيل فاتورة المبيعات #{invoiceId}
            </h1>
          </div>
          <p className="text-sm text-[var(--erp-muted)]">
            عرض معلومات الفاتورة، العميل، الخصم، المنتجات، والحالة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/sales-invoices")}
          className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition hover:bg-[var(--erp-nav-active-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة للفواتير
        </button>
      </section>

      {isLoading && (
        <section className="rounded-[24px] bg-[var(--erp-card)] p-10 shadow-[var(--erp-shadow)]">
          <div className="flex items-center justify-center gap-2 text-[var(--erp-muted)]">
            <Loader2 className="size-5 animate-spin" />
            جاري تحميل تفاصيل الفاتورة...
          </div>
        </section>
      )}

      {isError && (
        <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            لم يتم تحميل تفاصيل الفاتورة. تأكد من صلاحيات الحساب أو أن السيرفر
            يعمل.
          </div>
        </section>
      )}

      {invoice && (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">الحالة</p>
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">العميل</p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                {getCustomerName(invoice)}
              </p>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">الإجمالي</p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                {formatMoney(getInvoiceTotal(invoice))}
              </p>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">المبلغ المدفوع</p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                {formatMoney(invoice.amountPaid)}
              </p>
            </div>
          </section>

          <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="text-right">
                <h2 className="text-lg font-bold text-[var(--erp-text)]">
                  معلومات الفاتورة
                </h2>
                <p className="mt-1 text-sm text-[var(--erp-muted)]">
                  البيانات الأساسية القادمة من الباكند.
                </p>
              </div>

              {invoice.status === "COMPLETED" && (
                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={handleRefund}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Undo2 className="size-4" />
                  )}
                  استرداد الفاتورة
                </button>
              )}
            </div>

            {updateStatusMutation.isError && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                فشل تحديث حالة الفاتورة. قد تكون الحالة غير مسموح بها من
                الباكند.
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">رقم العميل</p>
                <p className="mt-2 font-semibold">
                  {invoice.customerId ?? invoice.customer?.id ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">رقم الكاشير</p>
                <p className="mt-2 font-semibold">
                  {invoice.cashierId ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">الخصم</p>
                <p className="mt-2 font-semibold">
                  {invoice.discount?.name ||
                    invoice.discount?.title ||
                    invoice.discountId ||
                    "لا يوجد"}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">المجموع الفرعي</p>
                <p className="mt-2 font-semibold">
                  {formatMoney(invoice.subtotal)}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">قيمة الخصم</p>
                <p className="mt-2 font-semibold">
                  {formatMoney(invoice.discountAmount)}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">المبلغ المتبقي</p>
                <p className="mt-2 font-semibold">
                  {formatMoney(invoice.remainingAmount)}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">تاريخ الإنشاء</p>
                <p className="mt-2 font-semibold">
                  {formatDate(invoice.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">آخر تحديث</p>
                <p className="mt-2 font-semibold">
                  {formatDate(invoice.updatedAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
            <h2 className="mb-4 text-lg font-bold text-[var(--erp-text)]">
              منتجات الفاتورة
            </h2>

            {!invoice.items || invoice.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--erp-muted)]">
                لا توجد منتجات ظاهرة في تفاصيل هذه الفاتورة.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-right text-sm">
                  <thead>
                    <tr className="border-b text-xs text-[var(--erp-muted)]">
                      <th className="px-3 py-2">رقم المنتج</th>
                      <th className="px-3 py-2">اسم المنتج</th>
                      <th className="px-3 py-2">الكمية</th>
                      <th className="px-3 py-2">سعر الوحدة</th>
                      <th className="px-3 py-2">الإجمالي</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id ?? `${item.productId}-${index}`}>
                        <td className="border-b px-3 py-3">
                          #{item.productId}
                        </td>

                        <td className="border-b px-3 py-3">
                          {item.product?.name || item.product?.title || "—"}
                        </td>

                        <td className="border-b px-3 py-3">
                          {item.quantity}
                        </td>

                        <td className="border-b px-3 py-3">
                          {formatMoney(
                            item.unitPrice ??
                              item.product?.sellingPrice ??
                              item.product?.price
                          )}
                        </td>

                        <td className="border-b px-3 py-3">
                          {formatMoney(item.totalPrice)}
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