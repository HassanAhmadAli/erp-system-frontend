import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import {
  getDiscounts,
  deleteDiscount,
  toggleDiscount,
  type DiscountType,
  type DiscountScope,
} from "@/services/discount-service"

import { Button } from "@/view/components/ui/button"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"

export function DiscountsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const [typeFilter, setTypeFilter] = useState("")
  const [scopeFilter, setScopeFilter] = useState("")

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const limit = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["discounts", page, search, typeFilter, scopeFilter],

    queryFn: () =>
      getDiscounts({
        page,
        limit,
        search: search || undefined,
        type: (typeFilter || undefined) as DiscountType | undefined,
        scope: (scopeFilter || undefined) as DiscountScope | undefined,
      }),
  })

  // Reset to first page when any filter changes so results stay consistent.
  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, scopeFilter])

  // Server already applies search/type/scope; render the returned page as-is.
  const discounts = data?.data ?? []

  async function handleDelete() {
    if (!deleteId) return

    try {
      await deleteDiscount(deleteId)

      setDeleteId(null)

      refetch()
    } catch (err) {
      console.error(err)
      alert("فشل حذف الخصم")
    }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      await toggleDiscount(id, !current)

      refetch()
    } catch (err) {
      console.error(err)
      alert("فشل تغيير حالة الخصم")
    }
  }

  if (isLoading) {
    return <p className="p-6">جاري تحميل الخصومات...</p>
  }

  if (error) {
    return <p className="p-6 text-red-500">حدث خطأ أثناء تحميل الخصومات</p>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الخصومات</h1>

        <div className="flex flex-wrap gap-2">
          <Link to="/discounts/active">
            <Button variant="outline">الخصومات الفعالة</Button>
          </Link>

          <Link to="/discounts/best">
            <Button variant="outline">أفضل خصم</Button>
          </Link>

          <Link to="/discounts/calculate">
            <Button variant="outline">حساب الخصم</Button>
          </Link>

          <Link to="/discounts/create">
            <Button>إضافة خصم</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Search */}
        <input
          type="text"
          placeholder="بحث باسم الخصم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border p-3 text-right"
        />

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border p-3"
        >
          <option value="">كل الأنواع</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED_AMOUNT">Fixed Amount</option>
        </select>

        {/* Scope Filter */}
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="rounded-xl border p-3"
        >
          <option value="">كل النطاقات</option>
          <option value="GLOBAL">GLOBAL</option>
          <option value="CATEGORY">CATEGORY</option>
          <option value="PRODUCT">PRODUCT</option>
          <option value="CUSTOMER">CUSTOMER</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">القيمة</th>
              <th className="p-3 text-right">النطاق</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">العمليات</th>
            </tr>
          </thead>

          <tbody>
            {discounts.map((discount) => (
              <tr key={discount.id} className="border-t">
                <td className="p-3">{discount.name}</td>

                <td className="p-3">{discount.type}</td>

                <td className="p-3">{discount.value}</td>

                <td className="p-3">{discount.scope}</td>

                <td className="p-3">{discount.isActive ? "مفعل" : "معطل"}</td>

                <td className="flex gap-2 p-3">
                  <Link to={`/discounts/${discount.id}`}>
                    <Button variant="outline">عرض</Button>
                  </Link>

                  <Link to={`/discounts/${discount.id}/edit`}>
                    <Button variant="secondary">تعديل</Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => handleToggle(discount.id, discount.isActive)}
                  >
                    {discount.isActive ? "تعطيل" : "تفعيل"}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setDeleteId(discount.id)}
                  >
                    حذف
                  </Button>
                </td>
              </tr>
            ))}

            {discounts.length === 0 && (
              <tr>
                <td className="p-6 text-center" colSpan={6}>
                  لا توجد خصومات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3">
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          السابق
        </Button>

        <span>الصفحة {page}</span>

        <Button
          disabled={data?.isFinalPage}
          onClick={() => setPage((p) => p + 1)}
        >
          التالي
        </Button>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
