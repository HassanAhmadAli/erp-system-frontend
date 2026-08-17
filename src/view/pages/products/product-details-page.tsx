import {
  AlertTriangle,
  ArrowRight,
  Barcode,
  Boxes,
  CalendarClock,
  ImageOff,
  Package,
  Pencil,
  Tag,
  Truck,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"

import { useProductById } from "@/hooks/Products/useProductById"
import { getProductImageSrc, type Product } from "@/services/product-service"
import {
  formatCurrency,
  formatInteger,
  formatDateTime,
  toEnglishDigits,
} from "@/utils/number-formatters"
import {
  StatusBadge,
  type StockStatus,
} from "@/view/components/common/status-badge"
import { Button } from "@/view/components/ui/button"

function getStockStatus(product: Product): StockStatus {
  const quantity = product.quantityInStock ?? 0
  const minQuantity = product.minQuantity ?? 0

  if (quantity <= 0) return "outOfStock"
  if (minQuantity > 0 && quantity <= minQuantity) return "lowStock"

  return "inStock"
}

function formatText(value?: string | number | null) {
  const text = value === null || value === undefined ? "" : String(value).trim()

  return text ? toEnglishDigits(text) : "-"
}

function ProductDetailItem({
  label,
  value,
  ltr = false,
}: {
  label: string
  value?: string
  ltr?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className={`mt-2 font-semibold text-[var(--erp-text)] ${
          ltr ? "text-left tabular-nums" : "text-start"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  )
}

function ProductInfoCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center gap-2 text-start">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[var(--erp-accent)]/10 text-[var(--erp-accent)]">
          {icon}
        </div>

        <h2 className="text-lg font-bold text-[var(--erp-text)]">{title}</h2>
      </div>

      <div className="grid gap-3">{children}</div>
    </article>
  )
}

export function ProductDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const navigate = useNavigate()

  const productId = id ? Number(id) : null
  const isValidProductId =
    productId !== null && Number.isFinite(productId) && productId > 0

  const {
    data: product,
    isLoading,
    error,
  } = useProductById(isValidProductId ? productId : null)

  if (!isValidProductId) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-start shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                {t("pages:products.invalidProductId")}
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                {t("pages:products.invalidProductIdHint")}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/products")}
              >
                <ArrowRight className="size-4" />
                {t("pages:products.backToProducts")}
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]">
        <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-center shadow-[var(--erp-shadow)]">
          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:products.loadingDetails")}
          </p>
        </section>
      </main>
    )
  }

  if (!product || error) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-start shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                {t("pages:products.loadFailed")}
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                {t("pages:products.loadFailedHint")}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/products")}
              >
                <ArrowRight className="size-4" />
                {t("pages:products.backToProducts")}
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const status = getStockStatus(product)
  const imageSrc = getProductImageSrc(product.imageUrl)

  return (
    <main className="space-y-6 text-[var(--erp-text)]">
      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-start">
            <div className="flex items-center gap-2">
              <Package className="size-6 text-[var(--erp-accent)]" />

              <h1 className="text-2xl font-bold text-[var(--erp-text)]">
                {t("pages:products.details")}
              </h1>
            </div>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("pages:products.detailsSubtitle")}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              onClick={() => navigate("/products")}
            >
              <ArrowRight className="size-4" />
              {t("pages:products.backToProducts")}
            </Button>

            <Button
              type="button"
              className="w-full gap-2 sm:w-auto"
              onClick={() => navigate(`/products/${product.id}/edit`)}
            >
              <Pencil className="size-4" />
              {t("pages:products.edit")}
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4 text-start">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)]">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={formatText(product.name)}
                  className="size-full object-cover"
                />
              ) : (
                <ImageOff className="size-8 text-[var(--erp-muted)]" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-[var(--erp-text)]">
                {formatText(product.name)}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--erp-muted)]">
                {formatText(product.description) === "-"
                  ? t("pages:products.noDescription")
                  : formatText(product.description)}
              </p>
            </div>
          </div>

          <StatusBadge status={status} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductInfoCard
          title={t("pages:products.productInfo")}
          icon={<Barcode className="size-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label={t("pages:products.productNumber")}
              value={`#${formatInteger(product.id)}`}
              ltr
            />

            <ProductDetailItem
              label={t("common:barcode")}
              value={formatText(product.barcode)}
              ltr
            />

            <ProductDetailItem
              label={t("common:status")}
              value={t(`common:${status}`)}
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard
          title={t("pages:products.pricesAndStock")}
          icon={<Boxes className="size-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label={t("pages:products.purchasePrice")}
              value={formatCurrency(product.purchasePrice ?? 0)}
              ltr
            />

            <ProductDetailItem
              label={t("pages:products.sellingPrice")}
              value={formatCurrency(product.sellingPrice ?? 0)}
              ltr
            />

            <ProductDetailItem
              label={t("pages:products.currentQuantity")}
              value={formatInteger(product.quantityInStock ?? 0)}
              ltr
            />

            <ProductDetailItem
              label={t("pages:products.minQuantityLabel")}
              value={formatInteger(product.minQuantity ?? 0)}
              ltr
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard
          title={t("common:category")}
          icon={<Tag className="size-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label={t("common:categoryId")}
              value={
                product.categoryId
                  ? `#${formatInteger(product.categoryId)}`
                  : "-"
              }
              ltr
            />

            <ProductDetailItem
              label={t("pages:categories.categoryName")}
              value={formatText(product.category?.name)}
            />

            <ProductDetailItem
              label={t("pages:products.categoryDescription")}
              value={formatText(product.category?.description)}
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard
          title={t("common:supplier")}
          icon={<Truck className="size-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label={t("common:supplierId")}
              value={
                product.supplierId
                  ? `#${formatInteger(product.supplierId)}`
                  : "-"
              }
              ltr
            />

            <ProductDetailItem
              label={t("pages:products.supplierName")}
              value={formatText(product.supplier?.fullName)}
            />

            <ProductDetailItem
              label={t("common:phone")}
              value={formatText(product.supplier?.phone)}
              ltr
            />

            <ProductDetailItem
              label={t("common:email")}
              value={formatText(product.supplier?.email)}
              ltr
            />

            <ProductDetailItem
              label={t("common:address")}
              value={formatText(product.supplier?.address)}
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard
          title={t("pages:products.recordDates")}
          icon={<CalendarClock className="size-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label={t("common:createdAt")}
              value={formatDateTime(product.createdAt)}
              ltr
            />

            <ProductDetailItem
              label={t("common:updatedAt")}
              value={formatDateTime(product.updatedAt)}
              ltr
            />
          </div>
        </ProductInfoCard>
      </section>
    </main>
  )
}
