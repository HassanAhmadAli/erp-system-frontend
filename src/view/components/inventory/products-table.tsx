import { useState } from "react"
import { useTranslation } from "react-i18next"

import { EntityImage } from "@/view/components/common/entity-image"
import {
  StatusBadge,
  type StockStatus,
} from "@/view/components/common/status-badge"
import { useLocale } from "@/i18n/locale-provider"
import type { AppLanguage } from "@/i18n/types"
import { localizedName } from "@/lib/localized"
import { useLowStockProducts } from "@/hooks/Products/useLowStockProducts"
import {
  getProductImageSrc,
  getProductStoredFileId,
  type Product,
} from "@/services/product-service"
import { formatCurrency, formatNumber } from "@/utils/number-formatters"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

function getStockStatus(product: Product): StockStatus {
  const quantity = product.quantityInStock ?? 0
  const minimumQuantity = product.minQuantity ?? 0

  if (quantity <= 0) return "outOfStock"
  if (minimumQuantity > 0 && quantity <= minimumQuantity) return "lowStock"

  return "inStock"
}

function getCategoryName(product: Product, language: AppLanguage) {
  if (product.category) {
    const name = localizedName(product.category, language)
    if (name) return name
  }

  return product.categoryId != null ? String(product.categoryId) : "-"
}

export function ProductsTable() {
  const { t } = useTranslation(["common", "pages"])
  const [page, setPage] = useState(1)
  const { language } = useLocale()
  const { data, isLoading, error, isFetching } = useLowStockProducts({
    page,
    limit: PAGE_SIZE,
  })

  const products = data?.data ?? []

  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 text-start">
        <h3 className="text-xl font-bold text-[var(--erp-text)]">
          {t("pages:products.title")}
        </h3>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          {t("pages:inventory.lowStockSubtitle")}
        </p>
      </div>

      {isLoading && (
        <p className="text-start text-sm text-[var(--erp-muted)]">
          {t("common:loading")}
        </p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-start text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {t("pages:inventory.loadLowStockFailed")}
        </p>
      )}

      {!isLoading && !error && (
        <>
          <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed text-start text-sm">
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[22%]" />
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                </colgroup>

                <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      {t("common:product")}
                    </th>
                    <th className="px-4 py-3 font-medium">
                      {t("common:category")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      {t("common:price")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      {t("common:quantity")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      {t("common:status")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const imageSrc = getProductImageSrc(
                      product.imageUrl,
                      getProductStoredFileId(
                        product.imageUrl,
                        product.productPhotos
                      )
                    )
                    const displayName = localizedName(product, language)

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-[var(--erp-border)] bg-[var(--erp-card)] text-[var(--erp-text)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--erp-border)] bg-[var(--erp-bg)]">
                              <EntityImage
                                src={imageSrc}
                                alt={displayName}
                                className="size-full object-cover"
                              />
                            </div>

                            <span className="truncate font-semibold text-[var(--erp-text)]">
                              {displayName}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-[var(--erp-muted)]">
                          {getCategoryName(product, language)}
                        </td>

                        <td
                          dir="ltr"
                          className="px-4 py-3 text-center font-medium text-[var(--erp-text)] tabular-nums"
                        >
                          {product.sellingPrice
                            ? formatCurrency(product.sellingPrice)
                            : "-"}
                        </td>

                        <td
                          dir="ltr"
                          className="px-4 py-3 text-center font-medium text-[var(--erp-text)] tabular-nums"
                        >
                          {formatNumber(product.quantityInStock ?? 0)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <StatusBadge status={getStockStatus(product)} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-[var(--erp-muted)]"
                      >
                        {t("pages:inventory.noLowStockProducts")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4">
            <PaginationControls
              page={page}
              isFinalPage={data?.isFinalPage ?? true}
              isLoading={isFetching}
              total={data?.total}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          </div>
        </>
      )}
    </section>
  )
}
