import type { ComponentType } from "react"
import { useState } from "react"
import { Eye, UserCheck, UserX, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { useCustomers, useUpdateCustomerStatus } from "@/hooks/Suppliers/useCustomers"
import { CustomerStatusBadge } from "@/view/components/customers/customer-status-badge"
import { formatCurrency, formatNumber } from "@/utils/number-formatters"

type Customer = {
  id: number
  userId: number
  address?: string
  loyaltyPoints: number
  totalSpent: string
  user: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    isActive: boolean
  }
}

type CustomersResponse = {
  data: Customer[]
  total: number
  limit: number
  offset: number
  isFinalPage: boolean
}

export function CustomersPage() {
  const [search, setSearch] = useState("")

  const { data, isLoading, isError } = useCustomers()
  const updateStatus = useUpdateCustomerStatus()

  const response = data as CustomersResponse | undefined
  const customers = response?.data ?? []

  const activeCustomers = customers.filter((customer) => customer.user.isActive)
  const inactiveCustomers = customers.filter(
    (customer) => !customer.user.isActive
  )

  const totalLoyaltyPoints = customers.reduce(
    (sum, customer) => sum + customer.loyaltyPoints,
    0
  )

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.user.fullName
    const email = customer.user.email
    const phone = customer.user.phoneNumber

    return `${name} ${email} ${phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]">
      <header>
        <h1 className="text-3xl font-bold text-[var(--erp-text)]">العملاء</h1>
        <p className="mt-1 text-[var(--erp-muted)]">
          عرض وإدارة حسابات العملاء وحالتهم ونقاط الولاء الخاصة بهم.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CustomerStatCard
          label="إجمالي العملاء"
          value={response?.total ?? customers.length}
          icon={Users}
        />

        <CustomerStatCard
          label="العملاء النشطون"
          value={activeCustomers.length}
          icon={UserCheck}
        />

        <CustomerStatCard
          label="العملاء غير النشطين"
          value={inactiveCustomers.length}
          icon={UserX}
        />

        <CustomerStatCard
          label="نقاط الولاء"
          value={totalLoyaltyPoints}
          icon={UserCheck}
        />
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              قائمة العملاء
            </h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              عدد النتائج: {formatNumber(filteredCustomers.length)}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن عميل..."
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20 sm:w-72"
          />
        </div>

        {isLoading && (
          <p className="text-[var(--erp-muted)]">جاري تحميل العملاء...</p>
        )}

        {isError && (
          <p className="text-red-500 dark:text-red-300">
            حدث خطأ أثناء تحميل العملاء.
          </p>
        )}

        {!isLoading && !isError && filteredCustomers.length === 0 && (
          <p className="text-[var(--erp-muted)]">لا يوجد عملاء لعرضهم.</p>
        )}

        {!isLoading && !isError && filteredCustomers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-right text-sm">
                <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">الاسم</th>
                    <th className="px-4 py-3 font-medium">البريد الإلكتروني</th>
                    <th className="px-4 py-3 font-medium">الهاتف</th>
                    <th className="px-4 py-3 font-medium">العنوان</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3 font-medium">نقاط الولاء</th>
                    <th className="px-4 py-3 font-medium">إجمالي الإنفاق</th>
                    <th className="px-4 py-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => {
                    const isActive = customer.user.isActive

                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                      >
                        <td className="px-4 py-3 font-medium text-[var(--erp-text)]">
                          {customer.user.fullName}
                        </td>

                        <td className="px-4 py-3 text-[var(--erp-muted)]">
                          {customer.user.email}
                        </td>

                        <td className="px-4 py-3 text-[var(--erp-muted)]">
                          {customer.user.phoneNumber}
                        </td>

                        <td className="px-4 py-3 text-[var(--erp-muted)]">
                          {customer.address ?? "—"}
                        </td>

                        <td className="px-4 py-3">
                          <CustomerStatusBadge isActive={isActive} />
                        </td>

                        <td className="px-4 py-3 font-medium text-[var(--erp-text)]">
                          {formatNumber(customer.loyaltyPoints)}
                        </td>

                        <td className="px-4 py-3 font-medium text-[var(--erp-text)]">
                          {formatCurrency(customer.totalSpent)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/customers/${customer.id}`}
                              className="inline-flex items-center gap-1 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-3 py-1 text-xs font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
                            >
                              <Eye className="size-3" />
                              عرض
                            </Link>

                           <button
  disabled={updateStatus.isPending}
  onClick={() => {
    updateStatus.mutate({
      id: customer.id,
      status: isActive ? "inactive" : "active",
    })
  }}
  className={
    isActive
      ? "rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
      : "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
  }
>
  {isActive ? "تعطيل" : "تفعيل"}
</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

type CustomerStatCardProps = {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
}

function CustomerStatCard({ label, value, icon: Icon }: CustomerStatCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          <Icon className="size-5" />
        </div>
      </div>

      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--erp-text)]">
        {formatNumber(value)}
      </p>
    </div>
  )
}