import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Loader2, Package, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useProducts } from "@/hooks/Products/useProducts"
import { useLocale } from "@/i18n/locale-provider"
import { localizedName } from "@/lib/localized"
import type { Product } from "@/services/product-service"
import { formatId, toEnglishDigits } from "@/utils/number-formatters"

type ProductSearchSelectProps = {
  value: string
  onChange: (productId: string) => void
  label?: string
  includeAllOption?: boolean
  className?: string
}

function productMatchesQuery(
  product: Product,
  query: string,
  displayName: string
) {
  if (!query) return true

  const id = String(product.id)
  const barcode = toEnglishDigits(product.barcode ?? "").toLowerCase()
  const name = displayName.toLowerCase()
  const nameEn = (product.name ?? "").toLowerCase()
  const nameAr = (product.nameAr ?? "").toLowerCase()

  return (
    name.includes(query) ||
    nameEn.includes(query) ||
    nameAr.includes(query) ||
    barcode.includes(query) ||
    id.includes(query)
  )
}

export function ProductSearchSelect({
  value,
  onChange,
  label,
  includeAllOption = true,
  className,
}: ProductSearchSelectProps) {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(toEnglishDigits(search).trim())
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  const { data, isLoading, isError } = useProducts({
    limit: 50,
    search: debouncedSearch || undefined,
  })

  const products = data?.data ?? []

  const selectedFromList = useMemo(
    () => products.find((product) => String(product.id) === value) ?? null,
    [products, value]
  )

  useEffect(() => {
    if (!value) {
      setSelectedProduct(null)
      return
    }

    if (selectedFromList) {
      setSelectedProduct(selectedFromList)
    }
  }, [selectedFromList, value])

  const filteredProducts = useMemo(() => {
    const query = toEnglishDigits(search).trim().toLowerCase()

    return products.filter((product) =>
      productMatchesQuery(product, query, localizedName(product, language))
    )
  }, [language, products, search])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  function handleSelect(product: Product | null) {
    onChange(product ? String(product.id) : "")
    setSelectedProduct(product)
    setSearch("")
    setIsOpen(false)
  }

  const selectedLabel = selectedProduct
    ? `${localizedName(selectedProduct, language)} (#${formatId(selectedProduct.id)})`
    : value
      ? `#${formatId(value)}`
      : includeAllOption
        ? t("pages:financial.allProducts")
        : t("common:selectProduct")

  return (
    <div ref={containerRef} className={className ?? "relative max-w-md"}>
      <span className="mb-2 block text-sm font-medium text-[var(--erp-muted)]">
        {label ?? t("pages:financial.selectProduct")}
      </span>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-3 text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
      >
        <ChevronDown
          className={`size-4 shrink-0 text-[var(--erp-muted)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        <span
          className={`min-w-0 flex-1 truncate text-start ${
            value ? "text-[var(--erp-text)]" : "text-[var(--erp-muted)]"
          }`}
        >
          {selectedLabel}
        </span>

        <Package className="size-4 shrink-0 text-[var(--erp-brand-solid)]" />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] shadow-[var(--erp-shadow)]">
          <div className="border-b border-[var(--erp-border)] p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--erp-muted)]" />
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("pages:financial.searchProductPlaceholder")}
                className="w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-bg)] py-2.5 ps-10 pe-3 text-sm text-[var(--erp-text)] outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)]"
              />
            </label>
          </div>

          <div className="max-h-[260px] overflow-y-auto">
            {includeAllOption && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`flex w-full items-center justify-between gap-3 border-b border-[var(--erp-border)] px-4 py-3 text-start transition-colors ${
                  value === ""
                    ? "bg-[var(--erp-nav-active-bg)]"
                    : "hover:bg-[var(--erp-bg)]"
                }`}
              >
                <span className="font-medium text-[var(--erp-text)]">
                  {t("pages:financial.allProducts")}
                </span>
              </button>
            )}

            {isLoading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <Loader2 className="size-5 animate-spin text-[var(--erp-brand-solid)]" />
              </div>
            ) : isError ? (
              <p className="p-4 text-center text-sm text-red-500 dark:text-red-300">
                {t("pages:products.loadListFailed")}
              </p>
            ) : filteredProducts.length === 0 ? (
              <p className="p-4 text-center text-sm text-[var(--erp-muted)]">
                {t("pages:pos.noMatchingProducts")}
              </p>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = String(product.id) === value
                const displayName = localizedName(product, language)

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`flex w-full items-start justify-between gap-3 border-b border-[var(--erp-border)] px-4 py-3 text-start transition-colors last:border-0 ${
                      isSelected
                        ? "bg-[var(--erp-nav-active-bg)]"
                        : "hover:bg-[var(--erp-bg)]"
                    }`}
                  >
                    <span
                      dir="ltr"
                      className="shrink-0 text-xs text-[var(--erp-muted)] tabular-nums"
                    >
                      #{formatId(product.id)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--erp-text)]">
                        {displayName}
                      </p>
                      {product.barcode ? (
                        <p
                          dir="ltr"
                          className="truncate text-left text-xs text-[var(--erp-muted)]"
                        >
                          {toEnglishDigits(product.barcode)}
                        </p>
                      ) : null}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
