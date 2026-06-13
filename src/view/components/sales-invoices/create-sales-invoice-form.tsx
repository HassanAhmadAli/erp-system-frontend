import { type FormEvent, useState } from "react"
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react"

import { useCreateSalesInvoice } from "@/hooks/useSalesInvoices"

type InvoiceFormItem = {
  productId: string
  quantity: string
}

type CreateSalesInvoiceFormProps = {
  onCreated?: () => void
}

export function CreateSalesInvoiceForm({
  onCreated,
}: CreateSalesInvoiceFormProps) {
  const createMutation = useCreateSalesInvoice()

  const [customerId, setCustomerId] = useState("")
  const [discountId, setDiscountId] = useState("")
  const [amountPaid, setAmountPaid] = useState("0")
  const [complete, setComplete] = useState(false)
  const [items, setItems] = useState<InvoiceFormItem[]>([
    { productId: "", quantity: "1" },
  ])

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

  function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
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

    createMutation.mutate(
      {
        customerId: parsedCustomerId,
        discountId: parsedDiscountId,
        amountPaid: parsedAmountPaid,
        items: parsedItems,
        complete,
      },
      {
        onSuccess: () => {
          resetCreateForm()
          onCreated?.()
        },
      }
    )
  }

  return (
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
            حدث خطأ أثناء إنشاء الفاتورة. تأكد من أن الحساب الحالي يملك صلاحية
            الكاشير وأن البيانات صحيحة.
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
  )
}