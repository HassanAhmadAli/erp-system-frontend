import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Percent, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import {
  deleteDiscount,
  getDiscounts,
  toggleDiscount,
  type DiscountScope,
  type DiscountType,
} from "@/services/discount-service"
import { cn } from "@/lib/utils"
import { formatId, formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"

function getDiscountTypeLabel(type: DiscountType) {
  return type === "PERCENTAGE" ? "نسبة مئوية" : "مبلغ ثابت"
}

function getDiscountScopeLabel(scope: DiscountScope) {
  const labels: Record<DiscountScope, string> = {
    GLOBAL: "عام",
    CATEGORY: "تصنيف",
    PRODUCT: "منتج",
  }

  return labels[scope]
}

function formatDiscountValue(type: DiscountType, value: string) {
  const formattedValue = formatNumber(value)

  return type === "PERCENTAGE" ? `${formattedValue}%` : `${formattedValue} SYP`
}

function statusBadgeClass(isActive: boolean) {
  return isActive
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
    : "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300"
}

export function DiscountsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState("")
  const [scopeFilter, setScopeFilter] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState("")

  const limit = 10

  const { data, isLoading, error, refetch, isFetching } = useQuery({
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

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, scopeFilter])

  const discounts = data?.data ?? []

  async function handleDelete() {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      setActionError("")
      await deleteDiscount(deleteId)
      setDeleteId(null)
      refetch()
    } catch (err) {
      console.error(err)
      setActionError("فشل حذف الخصم")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      setActionError("")
      await toggleDiscount(id, !current)
      refetch()
    } catch (err) {
      console.error(err)
      setActionError("فشل تغيير حالة الخصم")
    }
  }

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              إدارة الخصومات
            </h1>
            <Percent className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إدارة الخصومات، تفعيلها، حساب قيمتها، ومراجعة الخصومات المناسبة.
          </p>
        </div>

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
            <Button className="gap-2">
              <Plus className="size-4" />
              إضافة خصم
            </Button>
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            placeholder="بحث باسم الخصم..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
          >
            <option value="">كل الأنواع</option>
            <option value="PERCENTAGE">نسبة مئوية</option>
            <option value="FIXED_AMOUNT">مبلغ ثابت</option>
          </select>

          <select
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
          >
            <option value="">كل النطاقات</option>
            <option value="GLOBAL">عام</option>
            <option value="CATEGORY">تصنيف</option>
            <option value="PRODUCT">منتج</option>
          </select>
        </div>

        {actionError && (
          <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {actionError}
          </p>
        )}

        {isLoading && (
          <p className="text-sm text-[var(--erp-muted)]">
            جاري تحميل الخصومات...
          </p>
        )}

        {error && (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            حدث خطأ أثناء تحميل الخصومات.
          </p>
        )}

        {!isLoading && !error && discounts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
            <p className="text-sm text-[var(--erp-muted)]">
              لا توجد خصومات مطابقة.
            </p>
          </div>
        )}

        {!isLoading && !error && discounts.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full table-fixed text-right text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[15%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[22%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">الاسم</th>
                  <th className="px-3 py-3 font-medium">النوع</th>
                  <th className="px-3 py-3 font-medium">القيمة</th>
                  <th className="px-3 py-3 font-medium">النطاق</th>
                  <th className="px-3 py-3 text-center font-medium">الحالة</th>
                  <th className="px-3 py-3 text-center font-medium">
                    العمليات
                  </th>
                </tr>
              </thead>

              <tbody>
                {discounts.map((discount) => (
                  <tr
                    key={discount.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      <span className="block truncate">{discount.name}</span>
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      {getDiscountTypeLabel(discount.type)}
                    </td>

                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      {formatDiscountValue(discount.type, discount.value)}
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-muted)]">
                      {getDiscountScopeLabel(discount.scope)}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium",
                            statusBadgeClass(discount.isActive)
                          )}
                        >
                          {discount.isActive ? "مفعل" : "معطل"}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <Link to={`/discounts/${discount.id}`}>
                          <Button variant="outline" size="xs">
                            عرض
                          </Button>
                        </Link>

                        <Link to={`/discounts/${discount.id}/edit`}>
                          <Button variant="outline" size="xs">
                            تعديل
                          </Button>
                        </Link>

                        <Button
                          variant={discount.isActive ? "destructive" : "success"}
                          size="xs"
                          onClick={() =>
                            handleToggle(discount.id, discount.isActive)
                          }
                        >
                          {discount.isActive ? "تعطيل" : "تفعيل"}
                        </Button>

                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => setDeleteId(discount.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            السابق
          </Button>

          <span className="text-sm text-[var(--erp-muted)]">
            الصفحة {formatId(page)}
          </span>

          <Button
            variant="outline"
            disabled={data?.isFinalPage || isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            التالي
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={!!deleteId}
        title="حذف الخصم"
        description="هل أنت متأكد من حذف هذا الخصم؟ لا يمكن التراجع عن هذه العملية."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        isLoading={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}