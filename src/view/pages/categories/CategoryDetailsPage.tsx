import type { ReactNode } from "react"
import {
  ArrowRight,
  Barcode,
  FolderOpen,
  Hash,
  Package,
  Pencil,
  Tag,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"

import { getCategoryById } from "@/services/category-service"
import {
  formatCurrency,
  formatId,
  formatNumber,
} from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"
import { Button } from "@/view/components/ui/button"
import { CategoryImagePanel } from "@/view/components/categories/category-image-panel"

export function CategoryDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const categoryId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(categoryId),
    enabled: isValidId(categoryId),
  })

  if (!isValidId(categoryId)) {
    return <ErrorMessage message={t("pages:categories.invalidCategoryId")} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-[var(--erp-muted)]">
          {t("pages:categories.loadingCategory")}
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorMessage message={t("pages:categories.loadCategoryFailed")} />
  }

  const products = data.products ?? []
  const productCount = data._count?.products ?? products.length
  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.quantityInStock) || 0),
    0
  )
  const averageStock =
    productCount > 0 ? Math.round(totalStock / productCount) : 0

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {data.name}
          </h1>

          <p className="mt-2 text-[var(--erp-muted)]">
            {data.description || t("pages:categories.noDescription")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/categories/${categoryId}/edit`}>
            <Button className="gap-2">
              <Pencil className="size-4" />
              {t("pages:categories.edit")}
            </Button>
          </Link>

          <Link
            to="/categories"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            {t("pages:categories.backToCategories")}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label={t("pages:categories.productCount")}
          value={formatNumber(productCount)}
          icon={<Package className="size-5" />}
        />

        <SummaryCard
          label={t("pages:categories.totalStockQuantity")}
          value={formatNumber(totalStock)}
          icon={<Tag className="size-5" />}
        />

        <SummaryCard
          label={t("common:categoryId")}
          value={`#${formatId(data.id)}`}
          icon={<Hash className="size-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title={t("pages:categories.categoryInfo")}>
          <CustomerInfoRow
            label={t("pages:categories.categoryName")}
            value={data.name}
          />
          <CustomerInfoRow
            label={t("common:description")}
            value={data.description || t("common:notAvailable")}
          />
          <CustomerInfoRow
            label={t("common:categoryId")}
            value={`#${formatId(data.id)}`}
          />
          <CustomerInfoRow
            label={t("pages:categories.productCount")}
            value={formatNumber(productCount)}
          />
        </CustomerInfoCard>

        <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <div className="mb-4 flex items-center justify-end gap-2">
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              {t("pages:categories.stockSummary")}
            </h2>

            <FolderOpen className="size-5 text-[var(--erp-brand-solid)]" />
          </div>

          <div className="space-y-3 text-sm">
            <InfoLine
              label={t("pages:categories.linkedProducts")}
              value={formatNumber(productCount)}
            />

            <InfoLine
              label={t("pages:categories.totalUnits")}
              value={formatNumber(totalStock)}
            />

            <InfoLine
              label={t("pages:categories.avgQuantityPerProduct")}
              value={formatNumber(averageStock)}
            />
          </div>
        </section>
      </section>

      <CategoryImagePanel
        categoryId={categoryId}
        imageUrl={data.imageUrl}
        storedFileId={data.storedFileId}
      />

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--erp-muted)]">
            {t("pages:categories.productCountLabel", {
              count: formatNumber(productCount),
            })}
          </span>

          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("pages:categories.productsInCategory")}
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center text-[var(--erp-muted)]">
            {t("pages:categories.noProductsInCategory")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full min-w-[800px] table-fixed text-start text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[16%]" />
                <col className="w-[13%]" />
                <col className="w-[16%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">
                    {t("pages:products.productName")}
                  </th>
                  <th className="px-3 py-3 font-medium">
                    {t("common:barcode")}
                  </th>
                  <th className="px-3 py-3 font-medium">
                    {t("pages:products.sellingPrice")}
                  </th>
                  <th className="px-3 py-3 font-medium">
                    {t("common:quantity")}
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    {t("common:operations")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      #{formatId(product.id)}
                    </td>

                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      <span className="block truncate">{product.name}</span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1 text-sm text-[var(--erp-muted)] tabular-nums"
                      >
                        <Barcode className="size-3.5" />
                        {product.barcode || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      {formatCurrency(product.sellingPrice)}
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-text)]">
                      {formatNumber(product.quantityInStock)}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          {t("pages:categories.viewProduct")}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-between">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>

      <p className="mt-3 text-2xl font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string | number }) {
  return (
    <p className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-3">
      <span className="text-[var(--erp-muted)]">{label}</span>
      <span className="font-medium text-[var(--erp-text)]">{value}</span>
    </p>
  )
}

function ErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/categories"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        <ArrowRight className="size-4" />
        {t("pages:categories.backToCategories")}
      </Link>
    </div>
  )
}
