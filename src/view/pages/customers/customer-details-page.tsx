import { ArrowRight, BadgeDollarSign, MapPin, Star, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { useCustomer } from "@/hooks/Suppliers/useCustomers"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"
import { CustomerStatusBadge } from "@/view/components/customers/customer-status-badge"
import { CustomerSummaryCard } from "@/view/components/customers/customer-summary-card"
import {
  formatCurrency,
  formatId,
  formatNumber,
} from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"

export function CustomerDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const customerId = Number(id)

  const { data: customer, isLoading, isError } = useCustomer(customerId)

  if (!isValidId(customerId)) {
    return <ErrorMessage message={t("pages:customers.invalidCustomerId")} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start">
        <p className="text-[var(--erp-muted)]">
          {t("pages:customers.loadingCustomer")}
        </p>
      </div>
    )
  }

  if (isError || !customer) {
    return <ErrorMessage message={t("pages:customers.loadFailed")} />
  }

  const isActive = customer.user.isActive

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <CustomerStatusBadge isActive={isActive} />
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {customer.user.fullName}
            </h1>
          </div>

          <p className="mt-2 text-[var(--erp-muted)]">
            {t("pages:customers.detailsSubtitle")}
          </p>
        </div>

        <Link
          to="/customers"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("pages:customers.backToCustomers")}
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CustomerSummaryCard
          label={t("pages:customers.accountStatus")}
          value={isActive ? t("common:active") : t("common:inactive")}
          icon={<User className="size-5" />}
          tone={isActive ? "green" : "red"}
        />

        <CustomerSummaryCard
          label={t("pages:customers.totalSpent")}
          value={formatCurrency(customer.totalSpent)}
          icon={<BadgeDollarSign className="size-5" />}
          tone="blue"
        />

        <CustomerSummaryCard
          label={t("pages:customers.loyaltyPoints")}
          value={formatNumber(customer.loyaltyPoints)}
          icon={<Star className="size-5" />}
          tone="yellow"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title={t("pages:customers.personalInfo")}>
          <CustomerInfoRow
            label={t("common:fullName")}
            value={customer.user.fullName}
          />
          <CustomerInfoRow
            label={t("common:email")}
            value={customer.user.email}
          />
          <CustomerInfoRow
            label={t("common:phoneNumber")}
            value={customer.user.phoneNumber}
          />
          <CustomerInfoRow
            label={t("common:address")}
            value={customer.address ?? t("common:notAvailable")}
          />
        </CustomerInfoCard>

        <CustomerInfoCard title={t("pages:customers.accountInfo")}>
          <CustomerInfoRow
            label={t("common:customerId")}
            value={formatId(customer.id)}
          />
          <CustomerInfoRow
            label={t("common:userId")}
            value={formatId(customer.user.id)}
          />
          <CustomerInfoRow
            label={t("pages:customers.totalSpent")}
            value={formatCurrency(customer.totalSpent)}
          />
          <CustomerInfoRow
            label={t("pages:customers.loyaltyPoints")}
            value={formatNumber(customer.loyaltyPoints)}
          />
        </CustomerInfoCard>
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-3 flex items-center justify-end gap-2">
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("pages:customers.notesTitle")}
          </h2>
          <MapPin className="size-5 text-[var(--erp-brand-solid)]" />
        </div>

        <p className="text-sm leading-7 text-[var(--erp-muted)]">
          {t("pages:customers.notesPlaceholder")}
        </p>
      </section>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/customers"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        {t("pages:customers.backToCustomers")}
      </Link>
    </div>
  )
}
