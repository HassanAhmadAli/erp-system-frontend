import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form"

import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"
import { normalizeProducts } from "@/services/product-service"
import type { DiscountFormValues } from "@/validation/discount-schema"

type DiscountFormProps = {
  register: UseFormRegister<DiscountFormValues>
  errors: FieldErrors<DiscountFormValues>
  watch: UseFormWatch<DiscountFormValues>
}

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const selectClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function DiscountForm({ register, errors, watch }: DiscountFormProps) {
  const scope = watch("scope")
  const type = watch("type")

  const { data: categoriesData } = useCategoriesForSelect()
  const { data: productsData } = useProducts()

  const categories = categoriesData?.data ?? []
  const products = normalizeProducts(productsData)

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className={labelClass}>اسم الخصم</label>
        <input
          {...register("name")}
          placeholder="مثال: خصم نهاية الأسبوع"
          className={inputClass}
        />
        <ErrorText message={errors.name?.message} />
      </div>

      <div>
        <label className={labelClass}>نوع الخصم</label>
        <select {...register("type")} className={selectClass}>
          <option value="PERCENTAGE">نسبة مئوية</option>
          <option value="FIXED_AMOUNT">مبلغ ثابت</option>
        </select>
        <ErrorText message={errors.type?.message} />
      </div>

      <div>
        <label className={labelClass}>نطاق الخصم</label>
        <select {...register("scope")} className={selectClass}>
          <option value="GLOBAL">عام لكل المتجر</option>
          <option value="CATEGORY">تصنيف محدد</option>
          <option value="PRODUCT">منتج محدد</option>
        </select>
        <ErrorText message={errors.scope?.message} />
      </div>

      {scope === "CATEGORY" && (
        <div className="md:col-span-2">
          <label className={labelClass}>التصنيف</label>
          <select {...register("categoryId")} className={selectClass}>
            <option value="">اختر التصنيف</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          <ErrorText message={errors.categoryId?.message} />
        </div>
      )}

      {scope === "PRODUCT" && (
        <div className="md:col-span-2">
          <label className={labelClass}>المنتج</label>
          <select {...register("productId")} className={selectClass}>
            <option value="">اختر المنتج</option>
            {products.map((product) => (
              <option key={product.id} value={String(product.id)}>
                {product.name}
              </option>
            ))}
          </select>
          <ErrorText message={errors.productId?.message} />
        </div>
      )}

      <div>
        <label className={labelClass}>
          {type === "PERCENTAGE" ? "النسبة" : "المبلغ"}
        </label>
        <input
          type="number"
          {...register("value")}
          placeholder={type === "PERCENTAGE" ? "مثال: 10" : "مثال: 5000"}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[var(--erp-muted)]">
          {type === "PERCENTAGE"
            ? "أدخل النسبة بدون علامة %."
            : "أدخل المبلغ بعملة SYP."}
        </p>
        <ErrorText message={errors.value?.message} />
      </div>

      <div>
        <label className={labelClass}>أقصى قيمة للفاتورة</label>
        <input
          type="number"
          {...register("maxInvoiceValue")}
          placeholder="اتركه فارغاً بدون حد"
          className={inputClass}
        />
        <ErrorText message={errors.maxInvoiceValue?.message} />
      </div>

      <div>
        <label className={labelClass}>عدد مرات الاستخدام</label>
        <input
          type="number"
          {...register("maxUses")}
          placeholder="اتركه فارغاً بدون حد"
          className={inputClass}
        />
        <ErrorText message={errors.maxUses?.message} />
      </div>

      <div>
        <label className={labelClass}>تاريخ البداية</label>
        <input
          type="date"
          {...register("startDate")}
          className={`${inputClass} [direction:ltr]`}
        />
        <ErrorText message={errors.startDate?.message} />
      </div>

      <div>
        <label className={labelClass}>تاريخ النهاية</label>
        <input
          type="date"
          {...register("endDate")}
          className={`${inputClass} [direction:ltr]`}
        />
        <ErrorText message={errors.endDate?.message} />
      </div>

      <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 md:col-span-2">
        <div className="text-right">
          <p className="text-sm font-semibold text-[var(--erp-text)]">
            تفعيل الخصم
          </p>
          <p className="mt-1 text-xs text-[var(--erp-muted)]">
            الخصم سيكون متاحاً للاستخدام فور الحفظ.
          </p>
        </div>

        <input
          type="checkbox"
          {...register("isActive")}
          className="size-5 accent-[var(--erp-brand-solid)]"
        />
      </label>
    </div>
  )
}