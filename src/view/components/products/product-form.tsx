import { useEffect, useState } from "react"

import type { Product, UpdateProductInput } from "@/services/product-service"
import { useCreateProduct } from "@/hooks/Products/useCreateProduct"
import { useUpdateProduct } from "@/hooks/Products/useUpdateProduct"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import {
  productFormValuesToPayload,
  productSchema,
  productZodErrorToFormErrors,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/validation/product-schema"

import { Button } from "@/view/components/ui/button"

type Props = {
  mode: "create" | "edit"
  productId?: number
  initialValues?: Product
  onSuccess?: () => void
}

const EMPTY_FORM: ProductFormValues = {
  name: "",
  description: "",
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
    description: product.description ?? "",
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
  "h-11 w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-3 text-right outline-none"

const textareaClass =
  "min-h-[88px] w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-3 py-2 text-right outline-none"

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
  const [form, setForm] = useState<ProductFormValues>(() =>
    toFormState(initialValues)
  )
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [submitError, setSubmitError] = useState("")

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
        await createMutation.mutateAsync(payload)
      } else if (isValidId(productId)) {
        await updateMutation.mutateAsync({
          id: productId,
          data: payload as UpdateProductInput,
        })
      } else {
        setSubmitError("معرف المنتج غير صالح")
        return
      }

      onSuccess?.()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "حدث خطأ أثناء حفظ المنتج"
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">اسم المنتج</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <ErrorText message={errors.name} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">الوصف</label>
          <textarea
            className={textareaClass}
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
          <ErrorText message={errors.description} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">الباركود</label>
          <input
            className={inputClass}
            value={form.barcode}
            onChange={(e) => setField("barcode", e.target.value)}
          />
          <ErrorText message={errors.barcode} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">التصنيف</label>
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => setField("categoryId", e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading ? "جاري التحميل..." : "اختر التصنيف"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesError && (
            <p className="mt-1 text-sm text-red-500">فشل تحميل التصنيفات</p>
          )}
          <ErrorText message={errors.categoryId} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">المورد</label>
          <select
            className={inputClass}
            value={form.supplierId}
            onChange={(e) => setField("supplierId", e.target.value)}
            disabled={suppliersLoading}
          >
            <option value="">
              {suppliersLoading ? "جاري التحميل..." : "اختر المورد"}
            </option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={String(supplier.id)}>
                {supplier.fullName}
              </option>
            ))}
          </select>
          {suppliersError && (
            <p className="mt-1 text-sm text-red-500">فشل تحميل الموردين</p>
          )}
          <ErrorText message={errors.supplierId} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">سعر الشراء</label>
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
          <label className="mb-2 block text-sm font-medium">سعر البيع</label>
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
            الكمية في المخزون
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
            الحد الأدنى للكمية
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

      {submitError && (
        <p className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex justify-start gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "جاري الحفظ..."
            : mode === "create"
              ? "إضافة المنتج"
              : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
  )
}