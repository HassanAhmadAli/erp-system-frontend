import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Loader2, Percent, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useDiscounts } from "@/hooks/use-discounts"
import { useLocale } from "@/i18n/locale-provider"
import {
  formatDiscountValue,
  getDiscountScopeLabel,
  getDiscountTypeLabel,
} from "@/lib/discount-labels"
import { localizedName } from "@/lib/localized"
import type { Discount } from "@/services/discount-service"
import { formatId, toEnglishDigits } from "@/utils/number-formatters"

type DiscountSearchSelectProps = {
  value: string
  onChange: (discountId: string) => void
  label?: string
}

function discountMatchesQuery(
  discount: Discount,
  query: string,
  displayName: string
) {
  if (!query) return true

  const id = String(discount.id)
  const name = displayName.toLowerCase()
  const nameEn = (discount.name ?? "").toLowerCase()
  const nameAr = (discount.nameAr ?? "").toLowerCase()

  return (
    name.includes(query) ||
    nameEn.includes(query) ||
    nameAr.includes(query) ||
    id.includes(query)
  )
}

export function DiscountSearchSelect({
  value,
  onChange,
  label,
}: DiscountSearchSelectProps) {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
    null
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(toEnglishDigits(search).trim())
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  const { data, isLoading, isError } = useDiscounts({
    limit: 50,
    search: debouncedSearch || undefined,
  })

  const discounts = data?.data ?? []

  const selectedFromList = useMemo(
    () => discounts.find((discount) => String(discount.id) === value) ?? null,
    [discounts, value]
  )

  useEffect(() => {
    if (!value) {
      setSelectedDiscount(null)
      return
    }

    if (selectedFromList) {
      setSelectedDiscount(selectedFromList)
    }
  }, [selectedFromList, value])

  const filteredDiscounts = useMemo(() => {
    const query = toEnglishDigits(search).trim().toLowerCase()

    return discounts.filter((discount) =>
      discountMatchesQuery(discount, query, localizedName(discount, language))
    )
  }, [discounts, language, search])

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

  function handleSelect(discount: Discount) {
    onChange(String(discount.id))
    setSelectedDiscount(discount)
    setSearch("")
    setIsOpen(false)
  }

  const selectedLabel = selectedDiscount
    ? `${localizedName(selectedDiscount, language)} (#${formatId(selectedDiscount.id)})`
    : value
      ? `#${formatId(value)}`
      : t("common:selectDiscount")

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 block text-sm font-medium text-[var(--erp-text)]">
        {label ?? t("common:selectDiscount")}
      </span>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
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

        <Percent className="size-4 shrink-0 text-[var(--erp-brand-solid)]" />
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
                placeholder={t("pages:discounts.searchPlaceholder")}
                className="w-full rounded-xl border border-[var(--erp-border)] bg-[var(--erp-bg)] py-2.5 ps-10 pe-3 text-sm text-[var(--erp-text)] outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)]"
              />
            </label>
          </div>

          <div className="max-h-[280px] overflow-y-auto">
            {isLoading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <Loader2 className="size-5 animate-spin text-[var(--erp-brand-solid)]" />
              </div>
            ) : isError ? (
              <p className="p-4 text-center text-sm text-red-500 dark:text-red-300">
                {t("pages:discounts.loadFailed")}
              </p>
            ) : filteredDiscounts.length === 0 ? (
              <p className="p-4 text-center text-sm text-[var(--erp-muted)]">
                {t("pages:discounts.noMatching")}
              </p>
            ) : (
              filteredDiscounts.map((discount) => {
                const isSelected = String(discount.id) === value
                const displayName = localizedName(discount, language)

                return (
                  <button
                    key={discount.id}
                    type="button"
                    onClick={() => handleSelect(discount)}
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
                      #{formatId(discount.id)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--erp-text)]">
                        {displayName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--erp-muted)]">
                        {getDiscountTypeLabel(discount.type, t)} ·{" "}
                        {formatDiscountValue(discount.type, discount.value)} ·{" "}
                        {getDiscountScopeLabel(discount.scope, t)}
                        {" · "}
                        {discount.isActive
                          ? t("common:active")
                          : t("common:inactive")}
                      </p>
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
