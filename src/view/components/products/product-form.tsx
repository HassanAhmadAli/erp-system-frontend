import { useEffect, useState } from "react"
import { UploadCloud } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import type { Product, UpdateProductInput } from "@/services/product-service"
import { uploadProductPhoto } from "@/services/product-service"
import { useCreateProduct } from "@/hooks/Products/useCreateProduct"
import { useUpdateProduct } from "@/hooks/Products/useUpdateProduct"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { useLocale } from "@/i18n/locale-provider"
import { localizedFullName, localizedName } from "@/lib/localized"
import {
  productFormValuesToPayload,
  productSchema,
  productZodErrorToFormErrors,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/validation/product-schema"
import { isAllowedFileType, isWithinMaxFileSize } from "@/validation/helpers"
import { toEnglishDigits } from "@/utils/number-formatters"

import { Button } from "@/view/components/ui/button"

type Props = {
  mode: "create" | "edit"
  productId?: number
  initialValues?: Product
  onSuccess?: () => void
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const EMPTY_FORM: ProductFormValues = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
  barcode: "",
  purchasePrice: "",
  sellingPrice: "",
  quantityInStock: "",
  minQuantity: "",
  categoryId: "",
  supplierId: "",
}

function toFormState(product?: Product): ProductFormValues {
  if (!product) return EMPTY_FORM

  return {
    name: product.name ?? "",
    nameAr: product.nameAr ?? "",
    description: product.description ?? "",
    descriptionAr: product.descriptionAr ?? "",
    barcode: product.barcode ?? "",
    purchasePrice:
      product.purchasePrice != null ? String(product.purchasePrice) : "",
    sellingPrice:
      product.sellingPrice != null ? String(product.sellingPrice) : "",
    quantityInStock:
      product.quantityInStock != null ? String(product.quantityInStock) : "",
    minQuantity: product.minQuantity != null ? String(product.minQuantity) : "",
    categoryId:
      product.categoryId != null
        ? String(product.categoryId)
        : product.category?.id != null
          ? String(product.category.id)
          : "",
    supplierId:
      product.supplierId != null
        ? String(product.supplierId)
        : product.supplier?.id != null
          ? String(product.supplier.id)
          : "",
  }
}

const inputClass =
  "h-11 w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-3 text-start outline-none"

const textareaClass =
  "min-h-[88px] w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-3 py-2 text-start outline-none"

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return <p className="mt-1 text-sm text-red-500">{message}</p>
}

function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
}

export function ProductForm({
  mode,
  productId,
  initialValues,
  onSuccess,
}: Props) {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ProductFormValues>(() =>
    toFormState(initialValues)
  )
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitError, setSubmitError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (mode === "edit") setForm(toFormState(initialValues))
  }, [mode, initialValues])

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesForSelect()
  const {
    data: suppliersData,
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers()

  const categories = categoriesData?.data ?? []
  const suppliers = suppliersData?.data ?? []

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isSaving = createMutation.isPending || updateMutation.isPending

  function setField(key: keyof ProductFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleFileChange(file: File | null) {
    setSelectedFile(null)
    setSubmitError("")

    if (!file) return

    if (!isAllowedFileType(file, ALLOWED_IMAGE_TYPES)) {
      setSubmitError(t("common:invalidImageFile"))
      return
    }

    if (!isWithinMaxFileSize(file, MAX_IMAGE_BYTES)) {
      setSubmitError(t("common:imageTooLarge"))
      return
    }

    setSelectedFile(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError("")

    const validationResult = productSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(productZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    const payload = productFormValuesToPayload(validationResult.data)

    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(payload)

        if (selectedFile && isValidId(created?.id)) {
          try {
            await uploadProductPhoto(created.id, selectedFile)
            void queryClient.invalidateQueries({ queryKey: ["products"] })
            void queryClient.invalidateQueries({
              queryKey: ["product-photos", created.id],
            })
            void queryClient.invalidateQueries({
              queryKey: ["product", created.id],
            })
          } catch (error: unknown) {
            setSubmitError(
              error instanceof Error
                ? t("pages:products.createdImageUploadFailedWithError", {
                    error: error.message,
                  })
                : t("pages:products.createdImageUploadFailed")
            )
            navigate(`/products/${created.id}/edit`, { replace: true })
            return
          }
        }

        setSelectedFile(null)
      } else if (isValidId(productId)) {
        await updateMutation.mutateAsync({
          id: productId,
          data: payload as UpdateProductInput,
        })
      } else {
        setSubmitError(t("pages:products.invalidProductId"))
        return
      }

      onSuccess?.()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : t("pages:products.saveFailed")
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-start"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            {t("pages:products.productName")}
          </label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <ErrorText message={errors.name} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            {t("nameAr")}
          </label>
          <input
            className={inputClass}
            value={form.nameAr ?? ""}
            onChange={(e) => setField("nameAr", e.target.value)}
          />
          <ErrorText message={errors.nameAr} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            {t("common:description")}
          </label>
          <textarea
            className={textareaClass}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          <ErrorText message={errors.description} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            {t("descriptionAr")}
          </label>
          <textarea
            className={textareaClass}
            value={form.descriptionAr ?? ""}
            onChange={(e) => setField("descriptionAr", e.target.value)}
          />
          <ErrorText message={errors.descriptionAr} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("common:barcode")}
          </label>
          <input
            className={inputClass}
            value={form.barcode}
            onChange={(e) => setField("barcode", e.target.value)}
          />
          <ErrorText message={errors.barcode} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("common:category")}
          </label>
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading
                ? t("common:loading")
                : t("common:selectCategory")}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {localizedName(category, language)}
              </option>
            ))}
          </select>
          {categoriesError && (
            <p className="mt-1 text-sm text-red-500">
              {t("pages:products.loadCategoriesFailed")}
            </p>
          )}
          <ErrorText message={errors.categoryId} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("common:supplier")}
          </label>
          <select
            className={inputClass}
            value={form.supplierId}
            onChange={(e) => setField("supplierId", e.target.value)}
            disabled={suppliersLoading}
          >
            <option value="">
              {suppliersLoading
                ? t("common:loading")
                : t("common:selectSupplier")}
            </option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={String(supplier.id)}>
                {localizedFullName(supplier, language)}
              </option>
            ))}
          </select>
          {suppliersError && (
            <p className="mt-1 text-sm text-red-500">
              {t("pages:products.loadSuppliersFailed")}
            </p>
          )}
          <ErrorText message={errors.supplierId} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("pages:products.purchasePrice")}
          </label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={form.purchasePrice}
            onChange={(e) => setField("purchasePrice", e.target.value)}
          />
          <ErrorText message={errors.purchasePrice} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("pages:products.sellingPrice")}
          </label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={form.sellingPrice}
            onChange={(e) => setField("sellingPrice", e.target.value)}
          />
          <ErrorText message={errors.sellingPrice} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("pages:products.quantityInStock")}
          </label>
          <input
            type="number"
            step="1"
            className={inputClass}
            value={form.quantityInStock}
            onChange={(e) => setField("quantityInStock", e.target.value)}
          />
          <ErrorText message={errors.quantityInStock} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            {t("pages:products.minQuantity")}
          </label>
          <input
            type="number"
            step="1"
            className={inputClass}
            value={form.minQuantity}
            onChange={(e) => setField("minQuantity", e.target.value)}
          />
          <ErrorText message={errors.minQuantity} />
        </div>
      </div>

      {mode === "create" && (
        <div>
          <label
            htmlFor="product-image"
            className="mb-2 block text-sm font-medium"
          >
            {t("pages:products.productImageOptional")}
          </label>

          <label
            htmlFor="product-image"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-sidebar-divider)] bg-[var(--erp-bg)] px-4 py-6 text-center transition hover:border-[var(--erp-accent)]/50 hover:bg-[var(--erp-nav-active-bg)]"
          >
            <UploadCloud className="mb-2 size-7 text-[var(--erp-accent)]" />
            <span className="text-sm font-medium text-[var(--erp-text)]">
              {t("common:clickToSelectImage")}
            </span>
            <span className="mt-1 text-xs text-[var(--erp-muted)]">
              {t("common:imageFormats")}
            </span>
            <span
              dir="ltr"
              className="mt-3 max-w-full truncate rounded-full bg-[var(--erp-card)] px-3 py-1 text-xs font-medium text-[var(--erp-text)]"
            >
              {selectedFile?.name
                ? toEnglishDigits(selectedFile.name)
                : t("common:noFileSelected")}
            </span>
            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={isSaving}
              onChange={(event) => {
                handleFileChange(event.target.files?.[0] ?? null)
                event.target.value = ""
              }}
            />
          </label>
        </div>
      )}

      {submitError && (
        <p className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex justify-start gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? t("common:saving")
            : mode === "create"
              ? t("pages:products.create")
              : t("common:saveChanges")}
        </Button>
      </div>
    </form>
  )
}
