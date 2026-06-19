import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Loader2, Search, User } from "lucide-react"

import { usePosCustomers } from "@/hooks/usePos"
import type { Customer } from "@/services/customer-service"
import { toEnglishDigits } from "@/utils/number-formatters"

type PosCustomerSelectProps = {
  value: string
  onChange: (customerId: string) => void
}

function getCustomerLabel(customer: Customer) {
  return `${customer.user.fullName.trim()} (#${customer.id})`
}

export function PosCustomerSelect({ value, onChange }: PosCustomerSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data: customers = [], isLoading, isError } = usePosCustomers()

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.user.isActive),
    [customers]
  )

  const selectedCustomer = useMemo(
    () => activeCustomers.find((customer) => String(customer.id) === value),
    [activeCustomers, value]
  )

  const filteredCustomers = useMemo(() => {
    const query = toEnglishDigits(search).trim().toLowerCase()

    if (!query) {
      return activeCustomers
    }

    return activeCustomers.filter((customer) => {
      const name = customer.user.fullName.toLowerCase()
      const email = customer.user.email.toLowerCase()
      const phone = toEnglishDigits(customer.user.phoneNumber).toLowerCase()
      const id = String(customer.id)

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        id.includes(query)
      )
    })
  }, [activeCustomers, search])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(customer: Customer) {
    onChange(String(customer.id))
    setSearch("")
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 block text-sm text-[var(--erp-muted)]">العميل</span>

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--erp-muted)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        <span
          className={`min-w-0 flex-1 truncate text-right ${
            selectedCustomer
              ? "text-[var(--erp-text)]"
              : "text-[var(--erp-muted)]"
          }`}
        >
          {selectedCustomer
            ? getCustomerLabel(selectedCustomer)
            : "اختر عميلاً من القائمة"}
        </span>

        <User className="h-4 w-4 shrink-0 text-[var(--erp-accent)]" />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] shadow-[var(--erp-shadow)]">
          <div className="border-b border-[var(--erp-border)] p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--erp-muted)]" />
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(toEnglishDigits(event.target.value))
                }
                placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                className="w-full rounded-xl border border-[var(--erp-border)] bg-transparent py-2.5 ps-10 pe-3 text-sm text-[var(--erp-text)] outline-none placeholder:text-[var(--erp-muted)]"
              />
            </label>
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {isLoading ? (
              <div className="flex min-h-[120px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--erp-accent)]" />
              </div>
            ) : isError ? (
              <p className="p-4 text-center text-sm text-red-500">
                تعذر تحميل قائمة العملاء.
              </p>
            ) : filteredCustomers.length === 0 ? (
              <p className="p-4 text-center text-sm text-[var(--erp-muted)]">
                لا يوجد عملاء مطابقون للبحث.
              </p>
            ) : (
              filteredCustomers.map((customer) => {
                const isSelected = String(customer.id) === value

                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className={`flex w-full items-start justify-between gap-3 border-b border-[var(--erp-border)] px-4 py-3 text-right transition-colors last:border-0 ${
                      isSelected
                        ? "bg-[color-mix(in_srgb,var(--erp-accent)_10%,var(--erp-card))]"
                        : "hover:bg-[var(--erp-nav-active-bg)]"
                    }`}
                  >
                    <span
                      dir="ltr"
                      className="shrink-0 text-xs text-[var(--erp-muted)]"
                    >
                      #{customer.id}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--erp-text)]">
                        {customer.user.fullName.trim()}
                      </p>
                      <p className="truncate text-xs text-[var(--erp-text)]/65">
                        {customer.user.email}
                      </p>
                      <p
                        dir="ltr"
                        className="truncate text-left text-xs text-[var(--erp-text)]/65"
                      >
                        {customer.user.phoneNumber}
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
