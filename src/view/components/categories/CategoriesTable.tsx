import { useState } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  useCategories,
  useDeleteCategory,
} from "@/hooks/Categories/useCategories"
import { formatNumber } from "@/utils/number-formatters"
import { CategoriesSkeleton } from "./categories-skeleton"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { Button } from "@/view/components/ui/button"

const PAGE_SIZE = 15

export function CategoriesTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const navigate = useNavigate()

  const { data, isLoading, isError } = useCategories({
    search,
    page,
    limit: PAGE_SIZE,
  })

  const deleteMutation = useDeleteCategory()

  const categories = data?.data ?? []
  const isFinalPage = data?.isFinalPage ?? categories.length < PAGE_SIZE

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleConfirmDelete() {
    if (!deleteId) return

    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
      },
    })
  }

  if (isLoading) return <CategoriesSkeleton />

  if (isError) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        حدث خطأ أثناء تحميل التصنيفات.
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            قائمة التصنيفات
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            عدد النتائج: {formatNumber(categories.length)}
          </p>
        </div>

        <input
          placeholder="بحث باسم التصنيف أو الوصف..."
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
          className="w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20 md:max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
        <table className="w-full table-fixed text-right text-sm">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[36%]" />
            <col className="w-[16%]" />
            <col className="w-[24%]" />
          </colgroup>

          <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">الاسم</th>
              <th className="px-3 py-3 font-medium">الوصف</th>
              <th className="px-3 py-3 font-medium">المنتجات</th>
              <th className="px-3 py-3 text-center font-medium">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
              >
                <td className="px-3 py-4 font-medium text-[var(--erp-text)]">
                  <span className="block truncate">{category.name}</span>
                </td>

                <td className="px-3 py-4 text-[var(--erp-muted)]">
                  <span className="block truncate">
                    {category.description || "—"}
                  </span>
                </td>

                <td className="px-3 py-4 text-[var(--erp-text)]">
                  {formatNumber(category._count?.products ?? 0)}
                </td>

                <td className="px-3 py-4">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate(`/categories/${category.id}`)}
                    >
                      <Eye className="size-3.5" />
                      عرض
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        navigate(`/categories/${category.id}/edit`)
                      }
                    >
                      <Pencil className="size-3.5" />
                      تعديل
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="size-3.5" />
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-[var(--erp-muted)]"
                >
                  لا توجد تصنيفات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((currentPage) => currentPage - 1)}
        >
          السابق
        </Button>

        <span className="text-center text-sm text-[var(--erp-muted)]">
          صفحة {formatNumber(page)}
        </span>

        <Button
          type="button"
          variant="outline"
          disabled={isFinalPage}
          onClick={() => setPage((currentPage) => currentPage + 1)}
        >
          التالي
        </Button>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="حذف التصنيف"
        description="هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذه العملية."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
