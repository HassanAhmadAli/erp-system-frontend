import { useState } from "react"
import {
  useCategories,
  useDeleteCategory,
} from "@/hooks/Categories/useCategories"
import { CategoriesSkeleton } from "./categories-skeleton"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { useNavigate } from "react-router-dom"

export function CategoriesTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 15
  const navigate = useNavigate()

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useCategories({
    search,
    page,
    limit,
  })

  const deleteMutation = useDeleteCategory()

  if (isLoading) return <CategoriesSkeleton />

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        placeholder="بحث..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border p-2 text-right"
      />

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-[var(--erp-card)]">
        <table className="w-full text-right">
          <thead className="bg-[var(--erp-sidebar)]">
            <tr>
              <th className="p-3">الاسم</th>
              <th>الوصف</th>
              <th>المنتجات</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {data?.data.map((cat) => (
              <tr key={cat.id} className="border-t">
                <td className="p-3">{cat.name}</td>
                <td>{cat.description}</td>
                <td>{cat._count?.products}</td>

                <td className="flex gap-2 p-3">
                  <button
                    onClick={() => navigate(`/categories/${cat.id}/edit`)}
                    className="text-blue-500"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => navigate(`/categories/${cat.id}`)}
                    className="text-green-500"
                  >
                    عرض التفاصيل
                  </button>

                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="text-red-500"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          السابق
        </button>

        <button onClick={() => setPage((p) => p + 1)}>التالي</button>
      </div>

      <div>
        {" "}
        <button
          onClick={() => navigate("/categories/create")}
          className="rounded-xl bg-green-600 px-4 py-2 text-white"
        >
          اضافة صنف جديد
        </button>
      </div>

      {/* Delete Modal */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
