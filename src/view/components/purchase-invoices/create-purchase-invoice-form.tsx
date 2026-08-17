import { type FormEvent, useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useProductsBySupplier } from "@/hooks/Products/useProductsBySupplier"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { useCreatePurchaseInvoice } from "@/hooks/usePurchaseInvoices"
import { useLocale } from "@/i18n/locale-provider"
import { localizedFullName, localizedName } from "@/lib/localized"
import { formatId } from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"
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
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const createMutation = useCreatePurchaseInvoice()
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
    limit: 100,
  })
  const suppliers = suppliersData?.data ?? []
  const [supplierId, setSupplierId] = useState("")

  const selectedSupplierId = Number(supplierId)
  const hasSupplier = isValidId(selectedSupplierId)
  const { data: productsData, isLoading: productsLoading } =
    useProductsBySupplier(hasSupplier ? selectedSupplierId : 0, { limit: 100 })
  const products = hasSupplier ? (productsData?.data ?? []) : []

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
    // Products are supplier-scoped, so previously picked ones no longer apply.
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, productId: "" }))
    )
    setErrors((currentErrors) => ({
      ...currentErrors,
      supplierId: undefined,
      items: undefined,
    }))
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
          <div className="text-start">
            <h2 className="text-lg font-bold text-[var(--erp-text)]">
              {t("pages:purchaseInvoices.createTitle")}
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("pages:purchaseInvoices.createHint")}
            </p>
          </div>

          <button
            type="button"
            onClick={resetCreateForm}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            {t("common:clearFields")}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-start">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              {t("common:supplierId")}
            </span>
            <select
              value={supplierId}
              onChange={(event) => updateSupplierId(event.target.value)}
              disabled={suppliersLoading}
              className={`${inputClass} text-start`}
            >
              <option value="">
                {suppliersLoading
                  ? t("common:loading")
                  : t("common:selectSupplier")}
              </option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={String(supplier.id)}>
                  #{formatId(supplier.id)} —{" "}
                  {localizedFullName(supplier, language)}
                </option>
              ))}
            </select>{" "}
            <ErrorText message={errors.supplierId} />
          </label>

          <label className="space-y-2 text-start">
            <span className="text-sm font-medium text-[var(--erp-text)]">
              {t("common:invoiceDate")}
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
              {t("pages:purchaseInvoices.receiveProductsDirectly")}
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
              {t("common:invoiceItems")}
            </h3>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
            >
              <Plus className="size-4" />
              {t("common:add")} {t("common:product")}
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
              >
                <label className="space-y-2 text-start">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    {t("common:productId")}
                  </span>
                  <select
                    value={item.productId}
                    onChange={(event) =>
                      updateItem(index, "productId", event.target.value)
                    }
                    disabled={!hasSupplier || productsLoading}
                    className={`${smallInputClass} text-start`}
                  >
                    <option value="">
                      {!hasSupplier
                        ? t("pages:purchaseInvoices.selectSupplierFirst")
                        : productsLoading
                          ? t("common:loading")
                          : t("common:selectProduct")}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={String(product.id)}>
                        #{formatId(product.id)} —{" "}
                        {localizedName(product, language)}
                      </option>
                    ))}
                  </select>{" "}
                </label>

                <label className="space-y-2 text-start">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    {t("common:quantity")}
                  </span>

                  <input
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, "quantity", event.target.value)
                    }
                    placeholder="1"
                    inputMode="numeric"
                    className={`${smallInputClass} text-start`}
                  />
                </label>

                <label className="space-y-2 text-start">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    {t("common:unitCost")}
                  </span>

                  <input
                    value={item.unitCost}
                    onChange={(event) =>
                      updateItem(index, "unitCost", event.target.value)
                    }
                    placeholder="20"
                    inputMode="decimal"
                    className={`${smallInputClass} text-start`}
                  />
                </label>

                <label className="space-y-2 text-start">
                  <span className="text-xs font-medium text-[var(--erp-muted)]">
                    {t("pages:purchaseInvoices.optionalExpiryDate")}
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
                  {t("common:delete")}
                </button>
              </div>
            ))}
          </div>

          <ErrorText message={errors.items} />
        </div>

        {createMutation.isError && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {t("pages:purchaseInvoices.createFailed")}
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
            {t("common:createInvoice")}
          </button>
        </div>
      </form>
    </section>
  )
}
