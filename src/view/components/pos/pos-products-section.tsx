import { Loader2, PackageSearch } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { PosProduct } from "@/services/pos-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { PosProductCard } from "./pos-product-card"

type PosProductsSectionProps = {
  search: string
  products: PosProduct[]
  isLoading: boolean
  isError: boolean
  onSearchChange: (value: string) => void
  onAddToCart: (product: PosProduct) => void
}

export function PosProductsSection({
  search,
  products,
  isLoading,
  isError,
  onSearchChange,
  onAddToCart,
}: PosProductsSectionProps) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--erp-text)]">
            {t("pages:pos.productsTitle")}
          </h2>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:pos.productsSubtitle")}
          </p>
        </div>

        <div className="relative w-full md:w-[320px]">
          <PackageSearch className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--erp-muted)]" />
          <input
            value={search}
            onChange={(event) =>
              onSearchChange(toEnglishDigits(event.target.value))
            }
            placeholder={t("pages:pos.searchProductPlaceholder")}
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent py-3 ps-4 pe-10 text-sm text-[var(--erp-text)] outline-none placeholder:text-[var(--erp-muted)]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--erp-accent)]" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-500">
          {t("pages:pos.loadProductsFailed")}
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
          <PackageSearch className="h-12 w-12 text-[var(--erp-muted)]" />
          <h3 className="mt-3 font-semibold text-[var(--erp-text)]">
            {t("pages:pos.noMatchingProducts")}
          </h3>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:pos.noMatchingProductsHint")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <PosProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  )
}
