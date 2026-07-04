import { type FormEvent, useState } from "react"
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react"

import { useCreateSalesInvoice } from "@/hooks/useSalesInvoices"
import {
  salesInvoiceSchema,
  salesInvoiceValuesToPayload,
  salesInvoiceZodErrorToFormErrors,
  type SalesInvoiceFormErrors,
} from "@/validation/sales-invoice-schema"

type InvoiceFormItem = {
  productId: string
  quantity: string
}

type CreateSalesInvoiceFormProps = {
  onCreated?: () => void
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function CreateSalesInvoiceForm({
  onCreated,
}: CreateSalesInvoiceFormProps) {
  const createMutation = useCreateSalesInvoice()

  const [customerId, setCustomerId] = useState("")
  const [discountId, setDiscountId] = useState("")
  const [amountPaid, setAmountPaid] = useState("0")
  const [complete, setComplete] = useState(false)
  const [errors, setErrors] = useState<SalesInvoiceFormErrors>({})
  const [items, setItems] = useState<InvoiceFormItem[]>([
    { productId: "", quantity: "1" },
  ])

  function resetCreateForm() {
    setCustomerId("")
    setDiscountId("")
    setAmountPaid("0")
    setComplete(false)
    setErrors({})
    setItems([{ productId: "", quantity: "1" }])
  }

  function updateCustomerId(value: string) {
    setCustomerId(value)
    setErrors((currentErrors) => ({ ...currentErrors, customerId: undefined }))
  }

  function updateDiscountId(value: string) {
    setDiscountId(value)
    setErrors((currentErrors) => ({ ...currentErrors, discountId: undefined }))
  }

  function updateAmountPaid(value: string) {
    setAmountPaid(value)
    setErrors((currentErrors) => ({ ...currentErrors, amountPaid: undefined }))
  }

  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      { productId: "", quantity: "1" },
    ])
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

    const validationResult = salesInvoiceSchema.safeParse({
      customerId,
      discountId,
      amountPaid,
      items,
      complete,
    })

    if (!validationResult.success) {
      setErrors(salesInvoiceZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    createMutation.mutate(salesInvoiceValuesToPayload(validationResult.data), {
      onSuccess: () => {
        resetCreateForm()
        onCreated?.()
      },
    })
  }

  return (
    <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
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
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
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
              onChange={(event) => updateCustomerId(event.target.value)}
              placeholder="مثال: 1"
              inputMode="numeric"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
            />
            <ErrorText message={errors.customerId} />
          </label>

          <label className="space-y-2 text-right">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              رقم الخصم
            </span>
            <input
              value={discountId}
              onChange={(event) => updateDiscountId(event.target.value)}
              placeholder="اتركه فارغًا بدون خصم"
              inputMode="numeric"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
            />
            <ErrorText message={errors.discountId} />
          </label>

          <label className="space-y-2 text-right">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              المبلغ المدفوع
            </span>
            <input
              value={amountPaid}
              onChange={(event) => updateAmountPaid(event.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
            />
            <ErrorText message={errors.amountPaid} />
          </label>

          <label className="flex items-end gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5">
            <input
              type="checkbox"
              checked={complete}
              onChange={(event) => setComplete(event.target.checked)}
              className="size-4 accent-[var(--erp-brand-solid)]"
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
                className="grid gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-3 md:grid-cols-[1fr_1fr_auto]"
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
                    className="w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-3 py-2 text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
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
                    className="w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-3 py-2 text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
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
            حدث خطأ أثناء إنشاء الفاتورة. تأكد من أن الحساب الحالي يملك صلاحية
            الكاشير وأن البيانات صحيحة.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:!text-[#24114f]"
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
