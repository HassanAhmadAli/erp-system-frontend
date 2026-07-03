import { useEffect, useMemo, useState } from "react"

import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/services/product-service"
import { useCreateProduct } from "@/hooks/Products/useCreateProduct"
import { useUpdateProduct } from "@/hooks/Products/useUpdateProduct"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"

import { Button } from "@/view/components/ui/button"

type Props = {
  mode: "create" | "edit"
  productId?: number
  initialValues?: Product
  onSuccess?: () => void
}

type FormState = {
  name: string
  description: string
  barcode: string
  purchasePrice: string
  sellingPrice: string
  quantityInStock: string
  minQuantity: string
  categoryId: string
  supplierId: string
}

const EMPTY_FORM: FormState = {
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

function toFormState(product?: Product): FormState {
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

export function ProductForm({
  mode,
  productId,
  initialValues,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValues))
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})
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

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const validation = useMemo(() => {
    const next: Partial<Record<keyof FormState, string>> = {}

    if (!form.name.trim()) next.name = "اسم المنتج مطلوب"
    if (!form.barcode.trim()) next.barcode = "الباركود مطلوب"

    const numericFields: (keyof FormState)[] = [
      "purchasePrice",
      "sellingPrice",
      "quantityInStock",
      "minQuantity",
    ]
    for (const key of numericFields) {
      const value = form[key]
      if (value === "") {
        next[key] = "هذا الحقل مطلوب"
      } else if (Number.isNaN(Number(value)) || Number(value) < 0) {
        next[key] = "أدخل رقمًا صحيحًا"
      }
    }

    if (!form.categoryId) next.categoryId = "اختر التصنيف"
    if (!form.supplierId) next.supplierId = "اختر المورد"

    return next
  }, [form])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError("")

    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setErrors({})

    const payload: CreateProductInput & { description?: string } = {
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantityInStock: Number(form.quantityInStock),
      minQuantity: Number(form.minQuantity),
      categoryId: Number(form.categoryId),
      supplierId: Number(form.supplierId),
    }

    const description = form.description.trim()
    if (description) payload.description = description

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload)
      } else if (productId != null) {
        await updateMutation.mutateAsync({
          id: productId,
          data: payload as UpdateProductInput,
        })
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
        {/* NAME */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">اسم المنتج</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">الوصف</label>
          <textarea
            className="min-h-[88px] w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-3 py-2 text-right outline-none"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        {/* BARCODE */}
        <div>
          <label className="mb-2 block text-sm font-medium">الباركود</label>
          <input
            className={inputClass}
            value={form.barcode}
            onChange={(e) => setField("barcode", e.target.value)}
          />
          {errors.barcode && (
            <p className="mt-1 text-sm text-red-500">{errors.barcode}</p>
          )}
        </div>

        {/* CATEGORY */}
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
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categoriesError && (
            <p className="mt-1 text-sm text-red-500">فشل تحميل التصنيفات</p>
          )}
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>

        {/* SUPPLIER */}
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
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          {suppliersError && (
            <p className="mt-1 text-sm text-red-500">فشل تحميل الموردين</p>
          )}
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-500">{errors.supplierId}</p>
          )}
        </div>

        {/* PURCHASE PRICE */}
        <div>
          <label className="mb-2 block text-sm font-medium">سعر الشراء</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={form.purchasePrice}
            onChange={(e) => setField("purchasePrice", e.target.value)}
          />
          {errors.purchasePrice && (
            <p className="mt-1 text-sm text-red-500">{errors.purchasePrice}</p>
          )}
        </div>

        {/* SELLING PRICE */}
        <div>
          <label className="mb-2 block text-sm font-medium">سعر البيع</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={form.sellingPrice}
            onChange={(e) => setField("sellingPrice", e.target.value)}
          />
          {errors.sellingPrice && (
            <p className="mt-1 text-sm text-red-500">{errors.sellingPrice}</p>
          )}
        </div>

        {/* QUANTITY */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            الكمية في المخزون
          </label>
          <input
            type="number"
            className={inputClass}
            value={form.quantityInStock}
            onChange={(e) => setField("quantityInStock", e.target.value)}
          />
          {errors.quantityInStock && (
            <p className="mt-1 text-sm text-red-500">
              {errors.quantityInStock}
            </p>
          )}
        </div>

        {/* MIN QUANTITY */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            الحد الأدنى للكمية
          </label>
          <input
            type="number"
            className={inputClass}
            value={form.minQuantity}
            onChange={(e) => setField("minQuantity", e.target.value)}
          />
          {errors.minQuantity && (
            <p className="mt-1 text-sm text-red-500">{errors.minQuantity}</p>
          )}
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
