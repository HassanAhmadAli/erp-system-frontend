import { useEffect, useMemo, useState } from "react"

import {
  type Product,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/services/product-service"
import { useCreateProduct } from "@/hooks/useCreateProduct"
import { useCategoriesForSelect } from "@/hooks/useCategoriesForSelect"
import { useSuppliers } from "@/hooks/useSuppliers"
import { useUpdateProduct } from "@/hooks/useUpdateProduct"

type FormState = {
  name: string
  barcode: string
  purchasePrice: string
  sellingPrice: string
  quantityInStock: string
  minQuantity: string
  categoryId: string
  supplierId: string
}

function toNumberOrNaN(value: string) {
  if (value === "") return NaN
  return Number(value)
}

function getInitialCategoryId(initialValues?: Partial<Product> | null) {
  return initialValues?.categoryId ?? (initialValues?.category as any)?.id ?? 0
}

function getInitialSupplierId(initialValues?: Partial<Product> | null) {
  return initialValues?.supplierId ?? (initialValues?.supplier as any)?.id ?? 0
}

export function ProductForm({
  mode,
  productId,
  initialValues,
  onSuccess,
}: {
  mode: "create" | "edit"
  productId?: number
  initialValues?: Partial<Product> | null
  onSuccess: () => void
}) {
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const suppliersQuery = useSuppliers()

  const categoriesQuery = useCategoriesForSelect()

  const defaultState: FormState = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      barcode: initialValues?.barcode ?? "",
      purchasePrice:
        initialValues?.purchasePrice !== undefined
          ? String(initialValues.purchasePrice)
          : "",
      sellingPrice:
        initialValues?.sellingPrice !== undefined
          ? String(initialValues.sellingPrice)
          : "",
      quantityInStock:
        initialValues?.quantityInStock !== undefined
          ? String(initialValues.quantityInStock)
          : "",
      minQuantity:
        initialValues?.minQuantity !== undefined
          ? String(initialValues.minQuantity)
          : "",
      categoryId: String(getInitialCategoryId(initialValues)),
      supplierId: String(getInitialSupplierId(initialValues)),
    }),
    [initialValues]
  )

  const [form, setForm] = useState<FormState>(defaultState)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  useEffect(() => {
    setForm(defaultState)
  }, [defaultState])

  const isSubmitting =
    mode === "create" ? createMutation.isPending : updateMutation.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const name = form.name.trim()
    const barcode = form.barcode.trim()
    const categoryId = Number(form.categoryId)
    const supplierId = Number(form.supplierId)

    const purchasePrice = toNumberOrNaN(form.purchasePrice)
    const sellingPrice = toNumberOrNaN(form.sellingPrice)
    const quantityInStock = toNumberOrNaN(form.quantityInStock)
    const minQuantity = toNumberOrNaN(form.minQuantity)

    if (!name) return setMessage({ type: "error", text: "اسم المنتج مطلوب" })
    if (!barcode) return setMessage({ type: "error", text: "الباركود مطلوب" })
    if (!Number.isFinite(categoryId) || categoryId <= 0)
      return setMessage({ type: "error", text: "يرجى اختيار التصنيف" })
    if (!Number.isFinite(supplierId) || supplierId <= 0)
      return setMessage({ type: "error", text: "يرجى اختيار المورد" })

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0)
      return setMessage({ type: "error", text: "سعر الشراء غير صالح" })
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0)
      return setMessage({ type: "error", text: "سعر البيع غير صالح" })
    if (!Number.isFinite(quantityInStock) || quantityInStock < 0)
      return setMessage({ type: "error", text: "الكمية في المخزون غير صالحة" })
    if (!Number.isFinite(minQuantity) || minQuantity < 0)
      return setMessage({ type: "error", text: "الحد الأدنى غير صالح" })

    const payload: CreateProductInput & UpdateProductInput = {
      name,
      barcode,
      purchasePrice,
      sellingPrice,
      quantityInStock,
      minQuantity,
      categoryId,
      supplierId,
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload as CreateProductInput)
      } else {
        if (!productId) throw new Error("Missing productId")
        await updateMutation.mutateAsync({
          id: productId,
          data: payload as UpdateProductInput,
        })
      }

      setMessage({ type: "success", text: "تم الحفظ بنجاح" })
      onSuccess()
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "حدث خطأ أثناء حفظ المنتج",
      })
    }
  }

  const categories = categoriesQuery.data?.data ?? []

  const suppliers = suppliersQuery.data?.data ?? []

  const submitLabel = mode === "create" ? "إضافة المنتج" : "حفظ التعديلات"

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-6">
      {message && (
        <div
          className={`rounded-xl p-3 text-center text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-right text-sm">اسم المنتج</span>
          <input
            className="w-full rounded-xl border p-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم المنتج"
            disabled={isSubmitting}
          />
        </label>

        <label className="space-y-2">
          <span className="block text-right text-sm">الباركود</span>
          <input
            className="w-full rounded-xl border p-3"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            placeholder="الباركود"
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-right text-sm">سعر الشراء</span>
          <input
            type="number"
            className="w-full rounded-xl border p-3"
            value={form.purchasePrice}
            onChange={(e) =>
              setForm({ ...form, purchasePrice: e.target.value })
            }
            disabled={isSubmitting}
          />
        </label>

        <label className="space-y-2">
          <span className="block text-right text-sm">سعر البيع</span>
          <input
            type="number"
            className="w-full rounded-xl border p-3"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-right text-sm">الكمية في المخزون</span>
          <input
            type="number"
            className="w-full rounded-xl border p-3"
            value={form.quantityInStock}
            onChange={(e) =>
              setForm({ ...form, quantityInStock: e.target.value })
            }
            disabled={isSubmitting}
          />
        </label>

        <label className="space-y-2">
          <span className="block text-right text-sm">الحد الأدنى</span>
          <input
            type="number"
            className="w-full rounded-xl border p-3"
            value={form.minQuantity}
            onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-right text-sm">التصنيف</span>
          {categoriesQuery.isLoading ? (
            <div className="rounded-xl border p-3 text-right text-sm">
              جاري تحميل التصنيفات...
            </div>
          ) : categoriesQuery.error ? (
            <div className="rounded-xl border border-red-200 p-3 text-right text-sm text-red-700">
              فشل تحميل التصنيفات
            </div>
          ) : (
            <select
              className="h-11 w-full rounded-xl border p-3"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="0">-- اختر التصنيف --</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="space-y-2">
          <span className="block text-right text-sm">المورد</span>
          {suppliersQuery.isLoading ? (
            <div className="rounded-xl border p-3 text-right text-sm">
              جاري تحميل الموردين...
            </div>
          ) : suppliersQuery.error ? (
            <div className="rounded-xl border border-red-200 p-3 text-right text-sm text-red-700">
              فشل تحميل الموردين
            </div>
          ) : (
            <select
              className="h-11 w-full rounded-xl border p-3"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="0">-- اختر المورد --</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={
          isSubmitting || categoriesQuery.isLoading || suppliersQuery.isLoading
        }
        className="w-full rounded-xl bg-green-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "جاري الحفظ..." : submitLabel}
      </button>
    </form>
  )
}
