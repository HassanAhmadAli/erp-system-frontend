import { Eye, UserCheck, UserX, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

import { useCustomers, useUpdateCustomerStatus } from "@/hooks/useCustomers"

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
  const inactiveCustomers = customers.filter((customer) => !customer.user.isActive)

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
    <div className="space-y-6 text-right">
      <header>
        <h1 className="text-3xl font-bold">العملاء</h1>
        <p className="text-[var(--erp-muted)]">
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

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">قائمة العملاء</h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              عدد النتائج: {filteredCustomers.length}
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن عميل..."
            className="w-full rounded-2xl border px-4 py-2 text-right text-sm outline-none sm:w-72"
          />
        </div>

        {isLoading && (
          <p className="text-[var(--erp-muted)]">جاري تحميل العملاء...</p>
        )}

        {isError && (
          <p className="text-red-500">حدث خطأ أثناء تحميل العملاء.</p>
        )}

        {!isLoading && !isError && filteredCustomers.length === 0 && (
          <p className="text-[var(--erp-muted)]">لا يوجد عملاء لعرضهم.</p>
        )}

        {!isLoading && !isError && filteredCustomers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-[var(--erp-muted)]">
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
                    <tr key={customer.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {customer.user.fullName}
                      </td>

                      <td className="px-4 py-3">{customer.user.email}</td>

                      <td className="px-4 py-3">
                        {customer.user.phoneNumber}
                      </td>

                      <td className="px-4 py-3">
                        {customer.address ?? "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                          {isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>

                      <td className="px-4 py-3">{customer.loyaltyPoints}</td>

                      <td className="px-4 py-3">{customer.totalSpent} SP</td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-xs transition hover:bg-slate-50"
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
                            className="rounded-xl border px-3 py-1 text-xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
        )}
      </section>
    </div>
  )
}

type CustomerStatCardProps = {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}

function CustomerStatCard({ label, value, icon: Icon }: CustomerStatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="size-5 text-[var(--erp-brand-solid)]" />
        </div>
      </div>

      <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}