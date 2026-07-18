import { formatDateTime } from "@/utils/number-formatters"
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

import { apiRequest } from "@/api/client"
import { cn } from "@/lib/utils"
import { isValidId } from "@/validation/helpers"
import {
  isPurchaseInvoiceStatus,
  type PurchaseInvoiceStatus,
} from "@/validation/purchase-invoice-schema"

const PURCHASE_INVOICES_ENDPOINT = "/purchase/invoices"

type PurchaseInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitPrice?: string | number
  totalPrice?: string | number
  product?: {
    id: number
    name?: string
    title?: string
    purchasePrice?: string | number
    costPrice?: string | number
    buyingPrice?: string | number
    price?: string | number
  }
}

type PurchaseInvoice = {
  id: number
  supplierId?: number
  accountantId?: number
  warehouseWorkerId?: number
  status: PurchaseInvoiceStatus | string
  amountPaid?: string | number
  totalAmount?: string | number
  finalAmount?: string | number
  subtotal?: string | number
  remainingAmount?: string | number
  createdAt?: string
  updatedAt?: string
  supplier?: {
    id: number
    name?: string
    companyName?: string
    user?: {
      fullName?: string
      email?: string
      phoneNumber?: string
    }
  }
  items?: PurchaseInvoiceItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "معلقة",
  COMPLETED: "مكتملة",
  CANCELLED: "ملغاة",
  REFUNDED: "مستردة",
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  REFUNDED: "bg-sky-50 text-sky-700 ring-sky-200",
}

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

function formatNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return String(value)
  }

  return numberValue.toLocaleString("en-US")
}

function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"
  return `${formatNumber(value)} SYP`
}

function formatDate(value?: string | null) {
  return formatDateTime(value)
}
function getSupplierName(invoice: PurchaseInvoice) {
  return (
    invoice.supplier?.name ||
    invoice.supplier?.companyName ||
    invoice.supplier?.user?.fullName ||
    invoice.supplier?.user?.email ||
    `مورد #${invoice.supplierId ?? "—"}`
  )
}

function getInvoiceTotal(invoice: PurchaseInvoice) {
  return (
    invoice.finalAmount ??
    invoice.totalAmount ??
    invoice.subtotal ??
    invoice.amountPaid ??
    null
  )
}

function NumberText({ value }: { value: string | number }) {
  return (
    <span dir="ltr" className="inline-block tabular-nums">
      {value}
    </span>
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

export function PurchaseInvoiceDetailsPage() {
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
      setStatusError("رقم الفاتورة غير صالح.")
      return
    }

    if (!isPurchaseInvoiceStatus("COMPLETED")) {
      setStatusError("حالة الفاتورة غير صالحة.")
      return
    }

    updateStatusMutation.mutate("COMPLETED")
  }

  function handleCancel() {
    setStatusError("")

    if (!isValidId(invoiceId)) {
      setStatusError("رقم الفاتورة غير صالح.")
      return
    }

    if (!isPurchaseInvoiceStatus("CANCELLED")) {
      setStatusError("حالة الفاتورة غير صالحة.")
      return
    }

    updateStatusMutation.mutate("CANCELLED")
  }

  if (!isValidId(invoiceId)) {
    return (
      <main className="space-y-6" dir="rtl">
        <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-red-600">رقم الفاتورة غير صالح.</p>
          <button
            type="button"
            onClick={() => navigate("/purchase-invoices")}
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
              تفاصيل فاتورة الشراء{" "}
              <NumberText value={`#${formatNumber(invoiceId)}`} />
            </h1>
          </div>
          <p className="text-sm text-[var(--erp-muted)]">
            عرض معلومات الفاتورة، المورد، المنتجات، المبالغ، والحالة.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchase-invoices")}
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
            لم يتم تحميل تفاصيل فاتورة الشراء. تأكد من صلاحيات الحساب أو أن
            السيرفر يعمل.
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
              <p className="text-xs text-[var(--erp-muted)]">المورد</p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                {getSupplierName(invoice)}
              </p>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">الإجمالي</p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
              </p>
            </div>

            <div className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
              <p className="text-xs text-[var(--erp-muted)]">المبلغ المدفوع</p>
              <p className="mt-2 font-semibold text-[var(--erp-text)]">
                <NumberText value={formatMoney(invoice.amountPaid)} />
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
                    إكمال الفاتورة
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
                    إلغاء الفاتورة
                  </button>
                </div>
              )}
            </div>

            {updateStatusMutation.isError && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                فشل تحديث حالة الفاتورة. قد تكون الحالة غير مسموح بها من
                الباكند.
              </p>
            )}

            {statusError && (
              <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {statusError}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">رقم المورد</p>
                <p className="mt-2 font-semibold">
                  <NumberText
                    value={formatNumber(
                      invoice.supplierId ?? invoice.supplier?.id
                    )}
                  />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">رقم المحاسب</p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatNumber(invoice.accountantId)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  رقم عامل المستودع
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatNumber(invoice.warehouseWorkerId)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  المجموع الفرعي
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatMoney(invoice.subtotal)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">
                  المبلغ المتبقي
                </p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatMoney(invoice.remainingAmount)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">الإجمالي</p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatMoney(getInvoiceTotal(invoice))} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">تاريخ الإنشاء</p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatDate(invoice.createdAt)} />
                </p>
              </div>

              <div className="rounded-2xl border p-4">
                <p className="text-xs text-[var(--erp-muted)]">آخر تحديث</p>
                <p className="mt-2 font-semibold">
                  <NumberText value={formatDate(invoice.updatedAt)} />
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
                          <NumberText
                            value={`#${formatNumber(item.productId)}`}
                          />
                        </td>

                        <td className="border-b px-3 py-3">
                          {item.product?.name || item.product?.title || "—"}
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
