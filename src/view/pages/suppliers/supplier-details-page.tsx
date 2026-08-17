import type { ReactNode } from "react"
import {
  ArrowRight,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"

import { useSupplierById } from "@/hooks/Suppliers/useSupplierById"
import { formatId, formatNumber } from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"
import { Button } from "@/view/components/ui/button"

export function SupplierDetailsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const supplierId = Number(id)

  const {
    data: supplier,
    isLoading,
    isError,
  } = useSupplierById(isValidId(supplierId) ? supplierId : null)

  if (!isValidId(supplierId)) {
    return <ErrorMessage message={t("pages:suppliers.invalidSupplierId")} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-start text-[var(--erp-text)]">
        <p className="text-[var(--erp-muted)]">{t("common:loadingDetails")}</p>
      </div>
    )
  }

  if (isError || !supplier) {
    return <ErrorMessage message={t("pages:suppliers.loadFailed")} />
  }

  const productCount =
    supplier._count?.products ?? supplier.products?.length ?? 0
  const invoiceCount =
    supplier._count?.purchaseInvoices ?? supplier.purchaseInvoices?.length ?? 0

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {supplier.fullName}
          </h1>

          <p className="mt-2 text-[var(--erp-muted)]">
            {t("pages:suppliers.detailsSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/suppliers/${supplierId}/edit`}>
            <Button>{t("pages:suppliers.editSupplier")}</Button>
          </Link>

          <Link
            to="/suppliers"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            {t("pages:suppliers.backToSuppliers")}
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label={t("common:productCount")}
          value={formatNumber(productCount)}
          icon={<Package className="size-5" />}
        />

        <SummaryCard
          label={t("pages:suppliers.purchaseInvoices")}
          value={formatNumber(invoiceCount)}
          icon={<Truck className="size-5" />}
        />

        <SummaryCard
          label={t("common:supplierId")}
          value={formatId(supplier.id)}
          icon={<User className="size-5" />}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 className="mb-4 text-xl font-semibold text-[var(--erp-text)]">
          {t("pages:suppliers.supplierInfo")}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label={t("common:fullName")}
            value={supplier.fullName}
            icon={<User className="size-4" />}
          />

          <InfoRow
            label={t("common:phoneNumber")}
            value={supplier.phone}
            icon={<Phone className="size-4" />}
          />

          <InfoRow
            label={t("common:email")}
            value={supplier.email}
            icon={<Mail className="size-4" />}
          />

          <InfoRow
            label={t("common:address")}
            value={supplier.address || t("common:notAvailable")}
            icon={<MapPin className="size-4" />}
          />
        </div>
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

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-[var(--erp-text)]">
      <div className="mb-1 flex items-center justify-end gap-2 text-sm text-[var(--erp-muted)]">
        <span>{label}</span>
        {icon}
      </div>

      <p className="font-medium text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/suppliers"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        {t("pages:suppliers.backToSuppliers")}
      </Link>
    </div>
  )
}
