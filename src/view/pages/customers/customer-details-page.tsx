import { ArrowRight, BadgeDollarSign, MapPin, Star, User } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { useCustomer } from "@/hooks/useCustomers"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"
import { CustomerStatusBadge } from "@/view/components/customers/customer-status-badge"
import { CustomerSummaryCard } from "@/view/components/customers/customer-summary-card"

export function CustomerDetailsPage() {
  const { id } = useParams()
  const customerId = Number(id)

  const { data: customer, isLoading, isError } = useCustomer(customerId)

  if (!Number.isFinite(customerId)) {
    return <ErrorMessage message="رقم العميل غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات العميل...</p>
      </div>
    )
  }

  if (isError || !customer) {
    return <ErrorMessage message="تعذر تحميل بيانات العميل." />
  }

  const isActive = customer.user.isActive

  return (
    <div className="space-y-6 text-right">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <CustomerStatusBadge isActive={isActive} />
            <h1 className="text-3xl font-bold">{customer.user.fullName}</h1>
          </div>

          <p className="mt-2 text-[var(--erp-muted)]">
            تفاصيل حساب العميل ومعلومات الولاء.
          </p>
        </div>

        <Link
          to="/customers"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى العملاء
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CustomerSummaryCard
          label="حالة الحساب"
          value={isActive ? "نشط" : "غير نشط"}
          icon={<User className="size-5" />}
          tone={isActive ? "green" : "red"}
        />

        <CustomerSummaryCard
          label="إجمالي الإنفاق"
          value={`${customer.totalSpent} SP`}
          icon={<BadgeDollarSign className="size-5" />}
          tone="blue"
        />

        <CustomerSummaryCard
          label="نقاط الولاء"
          value={customer.loyaltyPoints}
          icon={<Star className="size-5" />}
          tone="yellow"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title="المعلومات الشخصية">
          <CustomerInfoRow label="الاسم الكامل" value={customer.user.fullName} />
          <CustomerInfoRow label="البريد الإلكتروني" value={customer.user.email} />
          <CustomerInfoRow label="رقم الهاتف" value={customer.user.phoneNumber} />
          <CustomerInfoRow label="العنوان" value={customer.address ?? "—"} />
        </CustomerInfoCard>

        <CustomerInfoCard title="معلومات الحساب">
          <CustomerInfoRow label="رقم العميل" value={customer.id} />
          <CustomerInfoRow label="رقم المستخدم" value={customer.user.id} />
          <CustomerInfoRow
            label="إجمالي الإنفاق"
            value={`${customer.totalSpent} SP`}
          />
          <CustomerInfoRow label="نقاط الولاء" value={customer.loyaltyPoints} />
        </CustomerInfoCard>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-end gap-2">
          <h2 className="text-xl font-semibold">ملاحظات</h2>
          <MapPin className="size-5 text-[var(--erp-brand-solid)]" />
        </div>

        <p className="text-sm leading-7 text-[var(--erp-muted)]">
          يمكن لاحقاً إضافة سجل الطلبات أو سجل نقاط الولاء الخاصة بهذا العميل
          عند توفر endpoints مناسبة من الباك اند.
        </p>
      </section>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-right">
      <p className="text-red-500">{message}</p>

      <Link
        to="/customers"
        className="inline-flex rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
      >
        العودة إلى العملاء
      </Link>
    </div>
  )
}