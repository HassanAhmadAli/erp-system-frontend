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
import { Link, useParams } from "react-router-dom"

import { useSupplierById } from "@/hooks/Suppliers/useSupplierById"
import { formatId, formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

export function SupplierDetailsPage() {
  const { id } = useParams()
  const supplierId = Number(id)

  const {
    data: supplier,
    isLoading,
    isError,
  } = useSupplierById(Number.isFinite(supplierId) ? supplierId : null)

  if (!Number.isFinite(supplierId)) {
    return <ErrorMessage message="رقم المورد غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات المورد...</p>
      </div>
    )
  }

  if (isError || !supplier) {
    return <ErrorMessage message="تعذر تحميل بيانات المورد." />
  }

  const productCount =
    supplier._count?.products ?? supplier.products?.length ?? 0
  const invoiceCount =
    supplier._count?.purchaseInvoices ?? supplier.purchaseInvoices?.length ?? 0

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {supplier.fullName}
          </h1>

          <p className="mt-2 text-[var(--erp-muted)]">
            تفاصيل المورد ومعلومات التواصل.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/suppliers/${supplierId}/edit`}>
            <Button>تعديل المورد</Button>
          </Link>

          <Link
            to="/suppliers"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            العودة إلى الموردين
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="عدد المنتجات"
          value={formatNumber(productCount)}
          icon={<Package className="size-5" />}
        />

        <SummaryCard
          label="فواتير الشراء"
          value={formatNumber(invoiceCount)}
          icon={<Truck className="size-5" />}
        />

        <SummaryCard
          label="رقم المورد"
          value={formatId(supplier.id)}
          icon={<User className="size-5" />}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 className="mb-4 text-xl font-semibold text-[var(--erp-text)]">
          معلومات المورد
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow
            label="الاسم الكامل"
            value={supplier.fullName}
            icon={<User className="size-4" />}
          />

          <InfoRow
            label="رقم الهاتف"
            value={supplier.phone}
            icon={<Phone className="size-4" />}
          />

          <InfoRow
            label="البريد الإلكتروني"
            value={supplier.email}
            icon={<Mail className="size-4" />}
          />

          <InfoRow
            label="العنوان"
            value={supplier.address || "—"}
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
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/suppliers"
        className="inline-flex rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        العودة إلى الموردين
      </Link>
    </div>
  )
}