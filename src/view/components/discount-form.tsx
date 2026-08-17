import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form"

import { useTranslation } from "react-i18next"

import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"

import { useProducts } from "@/hooks/Products/useProducts"

import { useLocale } from "@/i18n/locale-provider"

import { localizedName } from "@/lib/localized"

import { normalizeProducts } from "@/services/product-service"

import type { DiscountFormValues } from "@/validation/discount-schema"

type DiscountFormProps = {
  register: UseFormRegister<DiscountFormValues>

  errors: FieldErrors<DiscountFormValues>

  watch: UseFormWatch<DiscountFormValues>
}

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

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
  const { t } = useTranslation(["common", "pages"])

  const { language } = useLocale()

  const scope = watch("scope")

  const type = watch("type")

  const { data: categoriesData } = useCategoriesForSelect()

  const { data: productsData } = useProducts()

  const categories = categoriesData?.data ?? []

  const products = normalizeProducts(productsData)

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className={labelClass}>{t("common:discountName")}</label>

        <input
          {...register("name")}
          placeholder={t("pages:discounts.namePlaceholder")}
          className={inputClass}
        />

        <ErrorText message={errors.name?.message} />
      </div>

      <div className="md:col-span-2">
        <label className={labelClass}>{t("common:nameAr")}</label>

        <input {...register("nameAr")} className={inputClass} />

        <ErrorText message={errors.nameAr?.message} />
      </div>

      <div>
        <label className={labelClass}>{t("common:discountType")}</label>

        <select {...register("type")} className={selectClass}>
          <option value="PERCENTAGE">{t("common:percentage")}</option>

          <option value="FIXED_AMOUNT">{t("common:fixedAmount")}</option>
        </select>

        <ErrorText message={errors.type?.message} />
      </div>

      <div>
        <label className={labelClass}>{t("common:discountScope")}</label>

        <select {...register("scope")} className={selectClass}>
          <option value="GLOBAL">{t("common:scopeGlobalStore")}</option>

          <option value="CATEGORY">
            {t("pages:discounts.scopedCategory")}
          </option>

          <option value="PRODUCT">{t("pages:discounts.scopedProduct")}</option>
        </select>

        <ErrorText message={errors.scope?.message} />
      </div>

      {scope === "CATEGORY" && (
        <div className="md:col-span-2">
          <label className={labelClass}>{t("common:category")}</label>

          <select {...register("categoryId")} className={selectClass}>
            <option value="">{t("common:selectCategory")}</option>

            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {localizedName(category, language)}
              </option>
            ))}
          </select>

          <ErrorText message={errors.categoryId?.message} />
        </div>
      )}

      {scope === "PRODUCT" && (
        <div className="md:col-span-2">
          <label className={labelClass}>{t("common:product")}</label>

          <select {...register("productId")} className={selectClass}>
            <option value="">{t("common:selectProduct")}</option>

            {products.map((product) => (
              <option key={product.id} value={String(product.id)}>
                {localizedName(product, language)}
              </option>
            ))}
          </select>

          <ErrorText message={errors.productId?.message} />
        </div>
      )}

      <div>
        <label className={labelClass}>
          {type === "PERCENTAGE" ? t("common:percentage") : t("common:amount")}
        </label>

        <input
          type="number"
          {...register("value")}
          placeholder={
            type === "PERCENTAGE"
              ? t("common:examplePercent")
              : t("common:exampleAmount")
          }
          className={inputClass}
        />

        <p className="mt-1 text-xs text-[var(--erp-muted)]">
          {type === "PERCENTAGE"
            ? t("common:percentHint")
            : t("common:amountHint")}
        </p>

        <ErrorText message={errors.value?.message} />
      </div>

      <div>
        <label className={labelClass}>{t("common:maxInvoiceValueLabel")}</label>

        <input
          type="number"
          {...register("maxInvoiceValue")}
          placeholder={t("pages:discounts.leaveEmptyUnlimited")}
          className={inputClass}
        />

        <ErrorText message={errors.maxInvoiceValue?.message} />
      </div>

      <div>
        <label className={labelClass}>{t("pages:discounts.maxUses")}</label>

        <input
          type="number"
          {...register("maxUses")}
          placeholder={t("pages:discounts.leaveEmptyUnlimited")}
          className={inputClass}
        />

        <ErrorText message={errors.maxUses?.message} />
      </div>

      <div>
        <label className={labelClass}>{t("common:startDate")}</label>

        <input
          type="date"
          {...register("startDate")}
          className={`${inputClass} [direction:ltr]`}
        />

        <ErrorText message={errors.startDate?.message} />
      </div>

      <div>
        <label className={labelClass}>{t("common:endDate")}</label>

        <input
          type="date"
          {...register("endDate")}
          className={`${inputClass} [direction:ltr]`}
        />

        <ErrorText message={errors.endDate?.message} />
      </div>

      <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 md:col-span-2">
        <div className="text-start">
          <p className="text-sm font-semibold text-[var(--erp-text)]">
            {t("common:enableDiscountLabel")}
          </p>

          <p className="mt-1 text-xs text-[var(--erp-muted)]">
            {t("common:enableDiscountHint")}
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
