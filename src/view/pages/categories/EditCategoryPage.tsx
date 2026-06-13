import { ArrowRight } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategoryById, updateCategory } from "@/services/category-service"
import { useState, useEffect } from "react"

import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"

export function EditCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const categoryId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(categoryId),
    enabled: Number.isFinite(categoryId),
  })

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (data) {
      setName(data.name)
      setDescription(data.description || "")
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: () =>
      updateCategory(categoryId, {
        name,
        description,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", id] })

      navigate("/categories")
    },
    onError: () => {
      setErrorMessage("فشل تحديث التصنيف، حاول مرة أخرى")
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")

    if (!name.trim()) {
      setErrorMessage("اسم التصنيف مطلوب")
      return
    }

    mutation.mutate()
  }

  if (!Number.isFinite(categoryId)) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <p className="text-red-500">رقم التصنيف غير صالح.</p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى التصنيفات
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات التصنيف...</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <p className="text-red-500">تعذر تحميل بيانات التصنيف.</p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى التصنيفات
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6" dir="rtl">
      <header className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">تعديل التصنيف</h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات التصنيف ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/categories/${categoryId}`}
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-sm transition hover:bg-slate-50"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
      >
        <div>
          <label
            htmlFor="edit-category-name"
            className="mb-2 block text-sm font-medium"
          >
            اسم التصنيف
          </label>
          <input
            id="edit-category-name"
            className={inputClass}
            placeholder="أدخل اسم التصنيف"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="edit-category-description"
            className="mb-2 block text-sm font-medium"
          >
            الوصف
          </label>
          <input
            id="edit-category-description"
            className={inputClass}
            placeholder="أدخل وصف التصنيف (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-100 p-3 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/categories")}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}
