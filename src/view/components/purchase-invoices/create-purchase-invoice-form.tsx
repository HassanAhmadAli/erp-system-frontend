import { type FormEvent, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { useCreatePurchaseInvoice } from "@/hooks/usePurchaseInvoices"
import {
  getNextYearDateInputValue,
  getTodayDateTimeInputValue,
} from "./purchase-invoice-format"

type InvoiceFormItem = {
  productId: string
  quantity: string
  unitCost: string
  expiryDate: string
}

type CreatePurchaseInvoiceFormProps = {
  onCreated?: () => void
}

export function CreatePurchaseInvoiceForm({
  onCreated,
}: CreatePurchaseInvoiceFormProps) {
  const createMutation = useCreatePurchaseInvoice()

  const [supplierId, setSupplierId] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(getTodayDateTimeInputValue())
  const [receive, setReceive] = useState(false)
  const [items, setItems] = useState<InvoiceFormItem[]>([
    {
      productId: "",
      quantity: "1",
      unitCost: "",
      expiryDate: getNextYearDateInputValue(),
    },
  ])

  function resetCreateForm() {
    setSupplierId("")
    setInvoiceDate(getTodayDateTimeInputValue())
    setReceive(false)
    setItems([
      {
        productId: "",
        quantity: "1",
        unitCost: "",
        expiryDate: getNextYearDateInputValue(),
      },
    ])
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "1",
        unitCost: "",
        expiryDate: getNextYearDateInputValue(),
      },
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

    const parsedSupplierId = Number(supplierId)
    const parsedInvoiceDate = new Date(invoiceDate)

    if (!Number.isFinite(parsedSupplierId) || parsedSupplierId <= 0) {
      alert("أدخل رقم المورد بشكل صحيح")
      return
    }

    if (!invoiceDate || Number.isNaN(parsedInvoiceDate.getTime())) {
      alert("أدخل تاريخ الفاتورة بشكل صحيح")
      return
    }

    const hasInvalidItem = items.some((item) => {
      const productId = Number(item.productId)
      const quantity = Number(item.quantity)
      const unitCost = Number(item.unitCost)
      const expiryDate = new Date(item.expiryDate)

      return (
        !Number.isFinite(productId) ||
        productId <= 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitCost) ||
        unitCost < 0 ||
        !item.expiryDate ||
        Number.isNaN(expiryDate.getTime())
      )
    })

    if (hasInvalidItem) {
      alert("تأكد من رقم المنتج والكمية وتكلفة الوحدة وتاريخ الانتهاء")
      return
    }

    createMutation.mutate(
      {
        supplierId: parsedSupplierId,
        invoiceDate: parsedInvoiceDate.toISOString(),
        receive,
        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          expiryDate: new Date(item.expiryDate).toISOString(),
        })),
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
              إنشاء فاتورة شراء
            </h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              البيانات المطلوبة: المورد، تاريخ الفاتورة، المنتجات، تكلفة الوحدة،
              تاريخ الانتهاء، وخيار الاستلام.
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

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-right">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              رقم المورد
            </span>
            <input
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              placeholder="مثال: 1"
              inputMode="numeric"
              className="w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </label>

          <label className="space-y-2 text-right">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              تاريخ الفاتورة
            </span>
            <input
              type="datetime-local"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
              className="w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </label>

          <label className="flex items-end gap-3 rounded-2xl border px-4 py-2.5">
            <input
              type="checkbox"
              checked={receive}
              onChange={(event) => setReceive(event.target.checked)}
              className="size-4"
            />
            <span className="text-sm font-medium text-[var(--erp-text)]">
              استلام المنتجات مباشرة
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
                className="grid gap-3 rounded-2xl border p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
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

                <label className="space-y-2 text-right">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    تكلفة الوحدة
                  </span>
                  <input
                    value={item.unitCost}
                    onChange={(event) =>
                      updateItem(index, "unitCost", event.target.value)
                    }
                    placeholder="20"
                    inputMode="decimal"
                    className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
                  />
                </label>

                <label className="space-y-2 text-right">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    تاريخ الانتهاء
                  </span>
                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(event) =>
                      updateItem(index, "expiryDate", event.target.value)
                    }
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
            حدث خطأ أثناء إنشاء فاتورة الشراء. تأكد من الصلاحيات ومن صحة أرقام
            المورد والمنتجات.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            إنشاء الفاتورة
          </button>
        </div>
      </form>
    </section>
  )
}
