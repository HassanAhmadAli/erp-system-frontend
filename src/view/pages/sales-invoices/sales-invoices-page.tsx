import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  Eye,
  Loader2,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react"

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

type SalesInvoicesResponse =
  | SalesInvoice[]
  | {
      data: SalesInvoice[]
      total?: number
      limit?: number
      offset?: number
      isFinalPage?: boolean
    }

type CreateSalesInvoiceItem = {
  productId: number
  quantity: number
}

type CreateSalesInvoicePayload = {
  customerId: number
  discountId: number | null
  amountPaid: number
  items: CreateSalesInvoiceItem[]
  complete: boolean
}

type InvoiceFormItem = {
  productId: string
  quantity: string
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

function getSalesInvoices() {
  return apiRequest<SalesInvoicesResponse>("/sales/invoices")
}

function createSalesInvoice(payload: CreateSalesInvoicePayload) {
  return apiRequest<SalesInvoice>("/sales/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

function updateSalesInvoiceStatus(id: number, status: SalesInvoiceStatus) {
  return apiRequest<SalesInvoice>(`/sales/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

function normalizeInvoices(response?: SalesInvoicesResponse) {
  if (!response) return []

  if (Array.isArray(response)) {
    return response
  }

  return response.data ?? []
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

function getNextStatusOptions(status: string): SalesInvoiceStatus[] {
  if (status === "PENDING") return ["COMPLETED"]
  if (status === "COMPLETED") return ["REFUNDED"]
  return []
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

export function SalesInvoicesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [customerId, setCustomerId] = useState("")
  const [discountId, setDiscountId] = useState("")
  const [amountPaid, setAmountPaid] = useState("0")
  const [complete, setComplete] = useState(false)
  const [items, setItems] = useState<InvoiceFormItem[]>([
    { productId: "", quantity: "1" },
  ])

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["sales-invoices"],
    queryFn: getSalesInvoices,
  })

  const invoices = useMemo(() => normalizeInvoices(data), [data])

  const createMutation = useMutation({
    mutationFn: createSalesInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
      resetCreateForm()
      setIsCreateOpen(false)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number
      status: SalesInvoiceStatus
    }) => updateSalesInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-invoices"] })
    },
  })

  function resetCreateForm() {
    setCustomerId("")
    setDiscountId("")
    setAmountPaid("0")
    setComplete(false)
    setItems([{ productId: "", quantity: "1" }])
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      { productId: "", quantity: "1" },
    ])
  }

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  function updateItem(
    index: number,
    field: keyof InvoiceFormItem,
    value: string
  ) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    )
  }

  function handleCreateInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedCustomerId = Number(customerId)
    const parsedAmountPaid = Number(amountPaid)
    const parsedDiscountId = discountId.trim() ? Number(discountId) : null

    const parsedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }))

    const hasInvalidItem = parsedItems.some(
      (item) =>
        !Number.isFinite(item.productId) ||
        item.productId <= 0 ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
    )

    if (!Number.isFinite(parsedCustomerId) || parsedCustomerId <= 0) {
      alert("أدخل رقم العميل بشكل صحيح")
      return
    }

    if (!Number.isFinite(parsedAmountPaid) || parsedAmountPaid < 0) {
      alert("أدخل المبلغ المدفوع بشكل صحيح")
      return
    }

    if (
      parsedDiscountId !== null &&
      (!Number.isFinite(parsedDiscountId) || parsedDiscountId <= 0)
    ) {
      alert("أدخل رقم الخصم بشكل صحيح أو اتركه فارغاً")
      return
    }

    if (hasInvalidItem) {
      alert("تأكد من أرقام المنتجات والكميات")
      return
    }

    createMutation.mutate({
      customerId: parsedCustomerId,
      discountId: parsedDiscountId,
      amountPaid: parsedAmountPaid,
      items: parsedItems,
      complete,
    })
  }

  function handleStatusUpdate(id: number, status: SalesInvoiceStatus) {
    updateStatusMutation.mutate({ id, status })
  }

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />
            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              فواتير المبيعات
            </h1>
          </div>
          <p className="text-sm text-[var(--erp-muted)]">
            عرض الفواتير، إنشاء فاتورة جديدة، وتحديث حالة الفاتورة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-nav-active-bg)]"
          >
            <RefreshCw
              className={cn("size-4", isFetching && "animate-spin")}
            />
            تحديث
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen((currentValue) => !currentValue)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {isCreateOpen ? (
              <X className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {isCreateOpen ? "إغلاق النموذج" : "إنشاء فاتورة"}
          </button>
        </div>
      </section>

      {isCreateOpen && (
        <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
          <form className="space-y-5" onSubmit={handleCreateInvoice}>
            <div className="flex items-center justify-between gap-4">
              <div className="text-right">
                <h2 className="text-lg font-bold text-[var(--erp-text)]">
                  إنشاء فاتورة مبيعات
                </h2>
                <p className="mt-1 text-sm text-[var(--erp-muted)]">
                  أدخل رقم العميل، رقم الخصم إن وجد، المبلغ المدفوع، والمنتجات.
                </p>
              </div>

              <button
                type="button"
                onClick={resetCreateForm}
                className="rounded-2xl border px-4 py-2 text-sm"
              >
                تفريغ الحقول
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="space-y-2 text-right">
                <span className="text-sm font-medium text-[var(--erp-text)]">
                  رقم العميل
                </span>
                <input
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  placeholder="مثال: 1"
                  inputMode="numeric"
                  className="w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
                />
              </label>

              <label className="space-y-2 text-right">
                <span className="text-sm font-medium text-[var(--erp-text)]">
                  رقم الخصم
                </span>
                <input
                  value={discountId}
                  onChange={(event) => setDiscountId(event.target.value)}
                  placeholder="اتركه فارغاً بدون خصم"
                  inputMode="numeric"
                  className="w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
                />
              </label>

              <label className="space-y-2 text-right">
                <span className="text-sm font-medium text-[var(--erp-text)]">
                  المبلغ المدفوع
                </span>
                <input
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  placeholder="0"
                  inputMode="decimal"
                  className="w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
                />
              </label>

              <label className="flex items-end gap-3 rounded-2xl border px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={complete}
                  onChange={(event) => setComplete(event.target.checked)}
                  className="size-4"
                />
                <span className="text-sm font-medium text-[var(--erp-text)]">
                  إنشاء الفاتورة كمكتملة
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-[var(--erp-text)]">
                  عناصر الفاتورة
                </h3>

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm"
                >
                  <Plus className="size-4" />
                  إضافة منتج
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border p-3 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <label className="space-y-2 text-right">
                      <span className="text-xs font-medium text-[var(--erp-muted)]">
                        رقم المنتج
                      </span>
                      <input
                        value={item.productId}
                        onChange={(event) =>
                          updateItem(index, "productId", event.target.value)
                        }
                        placeholder="مثال: 1"
                        inputMode="numeric"
                        className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
                      />
                    </label>

                    <label className="space-y-2 text-right">
                      <span className="text-xs font-medium text-[var(--erp-muted)]">
                        الكمية
                      </span>
                      <input
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                        placeholder="1"
                        inputMode="numeric"
                        className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-40 md:self-end"
                    >
                      <Trash2 className="size-4" />
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {createMutation.isError && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                حدث خطأ أثناء إنشاء الفاتورة. تأكد من أن الحساب الحالي يملك
                صلاحية الكاشير وأن البيانات صحيحة.
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                إنشاء الفاتورة
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-right">
            <h2 className="text-lg font-bold text-[var(--erp-text)]">
              قائمة الفواتير
            </h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              عدد الفواتير المعروضة: {invoices.length}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-[var(--erp-muted)]">
            <Loader2 className="size-5 animate-spin" />
            جاري تحميل الفواتير...
          </div>
        )}

        {isError && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            لم يتم تحميل فواتير المبيعات. غالباً الحساب الحالي لا يملك صلاحية
            الكاشير أو المحاسب، أو أن السيرفر غير مشغل.
          </div>
        )}

        {!isLoading && !isError && invoices.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--erp-muted)]">
            لا توجد فواتير مبيعات حالياً.
          </div>
        )}

        {!isLoading && !isError && invoices.length > 0 && (
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
                  const nextStatuses = getNextStatusOptions(invoice.status)

                  return (
                    <tr key={invoice.id}>
                      <td className="rounded-r-2xl bg-[var(--erp-bg)] px-4 py-3 font-semibold">
                        #{invoice.id}
                      </td>

                      <td className="bg-[var(--erp-bg)] px-4 py-3">
                        {getCustomerName(invoice)}
                      </td>

                      <td className="bg-[var(--erp-bg)] px-4 py-3">
                        <StatusBadge status={invoice.status} />
                      </td>

                      <td className="bg-[var(--erp-bg)] px-4 py-3">
                        {formatMoney(getInvoiceTotal(invoice))}
                      </td>

                      <td className="bg-[var(--erp-bg)] px-4 py-3">
                        {formatMoney(invoice.amountPaid)}
                      </td>

                      <td className="bg-[var(--erp-bg)] px-4 py-3">
                        {formatDate(invoice.createdAt)}
                      </td>

                      <td className="bg-[var(--erp-bg)] px-4 py-3">
                        {nextStatuses.length > 0 ? (
                          <select
                            defaultValue=""
                            disabled={updateStatusMutation.isPending}
                            onChange={(event) => {
                              const value = event.target
                                .value as SalesInvoiceStatus

                              if (!value) return

                              handleStatusUpdate(invoice.id, value)
                              event.target.value = ""
                            }}
                            className="rounded-xl border bg-[var(--erp-card)] px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">اختر الحالة</option>
                            {nextStatuses.map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-[var(--erp-muted)]">
                            لا يوجد انتقال متاح
                          </span>
                        )}
                      </td>

                      <td className="rounded-l-2xl bg-[var(--erp-bg)] px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/sales-invoices/${invoice.id}`)
                          }
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
        )}

        {updateStatusMutation.isError && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            فشل تحديث حالة الفاتورة. قد تكون الحالة غير مسموح بها من الباكند.
          </p>
        )}
      </section>
    </main>
  )
}