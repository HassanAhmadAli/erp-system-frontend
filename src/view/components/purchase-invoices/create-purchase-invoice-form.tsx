import { type FormEvent, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { useCreatePurchaseInvoice } from "@/hooks/usePurchaseInvoices"
import {
  purchaseInvoiceSchema,
  purchaseInvoiceValuesToPayload,
  purchaseInvoiceZodErrorToFormErrors,
  type PurchaseInvoiceFormErrors,
} from "@/validation/purchase-invoice-schema"
import { getTodayDateTimeInputValue } from "./purchase-invoice-format"

type InvoiceFormItem = {
  productId: string
  quantity: string
  unitCost: string
  expiryDate: string
}

type CreatePurchaseInvoiceFormProps = {
  onCreated?: () => void
}

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const smallInputClass =
  "w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const dateInputClass = `${inputClass} text-left [direction:ltr]`
const smallDateInputClass = `${smallInputClass} text-left [direction:ltr]`

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

function getEmptyItem(): InvoiceFormItem {
  return {
    productId: "",
    quantity: "1",
    unitCost: "",
    expiryDate: "",
  }
}

export function CreatePurchaseInvoiceForm({
  onCreated,
}: CreatePurchaseInvoiceFormProps) {
  const createMutation = useCreatePurchaseInvoice()

  const [supplierId, setSupplierId] = useState("")
  const [invoiceDate, setInvoiceDate] = useState(getTodayDateTimeInputValue())
  const [receive, setReceive] = useState(false)
  const [errors, setErrors] = useState<PurchaseInvoiceFormErrors>({})
  const [items, setItems] = useState<InvoiceFormItem[]>([getEmptyItem()])

  function resetCreateForm() {
    setSupplierId("")
    setInvoiceDate(getTodayDateTimeInputValue())
    setReceive(false)
    setErrors({})
    setItems([getEmptyItem()])
  }

  function updateSupplierId(value: string) {
    setSupplierId(value)
    setErrors((currentErrors) => ({ ...currentErrors, supplierId: undefined }))
  }

  function updateInvoiceDate(value: string) {
    setInvoiceDate(value)
    setErrors((currentErrors) => ({ ...currentErrors, invoiceDate: undefined }))
  }

  function addItem() {
    setItems((currentItems) => [...currentItems, getEmptyItem()])
    setErrors((currentErrors) => ({ ...currentErrors, items: undefined }))
  }

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index)
    )

    setErrors((currentErrors) => ({ ...currentErrors, items: undefined }))
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

    setErrors((currentErrors) => ({ ...currentErrors, items: undefined }))
  }

  function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationResult = purchaseInvoiceSchema.safeParse({
      supplierId,
      invoiceDate,
      receive,
      items,
    })

    if (!validationResult.success) {
      setErrors(purchaseInvoiceZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    createMutation.mutate(
      purchaseInvoiceValuesToPayload(validationResult.data),
      {
        onSuccess: () => {
          resetCreateForm()
          onCreated?.()
        },
      }
    )
  }

  return (
    <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <form className="space-y-5" onSubmit={handleCreateInvoice}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-right">
            <h2 className="text-lg font-bold text-[var(--erp-text)]">
              إنشاء فاتورة شراء
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              البيانات المطلوبة: المورد، تاريخ الفاتورة، المنتجات، تكلفة الوحدة،
              وخيار الاستلام. تاريخ انتهاء المنتج اختياري.
            </p>
          </div>

          <button
            type="button"
            onClick={resetCreateForm}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
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
              onChange={(event) => updateSupplierId(event.target.value)}
              placeholder="مثال: 1"
              inputMode="numeric"
              className={`${inputClass} text-right`}
            />
            <ErrorText message={errors.supplierId} />
          </label>

          <label className="space-y-2 text-right">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              تاريخ الفاتورة
            </span>

            <input
              type="datetime-local"
              value={invoiceDate}
              onChange={(event) => updateInvoiceDate(event.target.value)}
              className={dateInputClass}
            />
            <ErrorText message={errors.invoiceDate} />
          </label>

          <label className="flex items-end justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              استلام المنتجات مباشرة
            </span>

            <input
              type="checkbox"
              checked={receive}
              onChange={(event) => setReceive(event.target.checked)}
              className="size-4 accent-[var(--erp-brand-solid)]"
            />
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
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
            >
              <Plus className="size-4" />
              إضافة منتج
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
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
                    className={`${smallInputClass} text-right`}
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
                    className={`${smallInputClass} text-right`}
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
                    className={`${smallInputClass} text-right`}
                  />
                </label>

                <label className="space-y-2 text-right">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    تاريخ الانتهاء اختياري
                  </span>

                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(event) =>
                      updateItem(index, "expiryDate", event.target.value)
                    }
                    className={smallDateInputClass}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40 md:self-end dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
                >
                  <Trash2 className="size-4" />
                  حذف
                </button>
              </div>
            ))}
          </div>

          <ErrorText message={errors.items} />
        </div>

        {createMutation.isError && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            حدث خطأ أثناء إنشاء فاتورة الشراء. تأكد من الصلاحيات ومن صحة أرقام
            المورد والمنتجات.
          </p>
        )}

        <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-5 py-2.5 text-sm font-semibold text-[var(--erp-brand-solid-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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