import { type FormEvent, useEffect, useState } from "react"
import { ArrowRight, FolderOpen } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getCategoryById, updateCategory } from "@/services/category-service"
import { formatId } from "@/utils/number-formatters"
import { isValidId } from "@/validation/helpers"
import {
  categoryFormValuesToPayload,
  categorySchema,
  categoryZodErrorToFormErrors,
  type CategoryFormErrors,
  type CategoryFormValues,
  type CategoryRequestPayload,
} from "@/validation/category-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: CategoryFormValues = {
  name: "",
  description: "",
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function EditCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const categoryId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(categoryId),
    enabled: isValidId(categoryId),
  })

  const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<CategoryFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        description: data.description ?? "",
      })
      setErrors({})
      setErrorMessage("")
    }
  }, [data])

  function setField(key: keyof CategoryFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const mutation = useMutation({
    mutationFn: (payload: CategoryRequestPayload) =>
      updateCategory(categoryId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", id] })

      navigate(`/categories/${categoryId}`)
    },

    onError: () => {
      setErrorMessage("فشل تحديث التصنيف، حاول مرة أخرى")
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!isValidId(categoryId)) {
      setErrorMessage("رقم التصنيف غير صالح")
      return
    }

    const validationResult = categorySchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(categoryZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})
    mutation.mutate(categoryFormValuesToPayload(validationResult.data))
  }

  if (!isValidId(categoryId)) {
    return <ErrorMessage message="رقم التصنيف غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات التصنيف...</p>
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorMessage message="تعذر تحميل بيانات التصنيف." />
  }

  return (
    <div
      className="mx-auto max-w-3xl space-y-6 text-right text-[var(--erp-text)]"
      dir="rtl"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              تعديل التصنيف #{formatId(categoryId)}
            </h1>

            <FolderOpen className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم بتحديث بيانات التصنيف ثم احفظ التغييرات.
          </p>
        </div>

        <Link
          to={`/categories/${categoryId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى التفاصيل
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
      >
        <div>
          <label htmlFor="edit-category-name" className={labelClass}>
            اسم التصنيف
          </label>

          <input
            id="edit-category-name"
            className={inputClass}
            placeholder="أدخل اسم التصنيف"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          <ErrorText message={errors.name} />
        </div>

        <div>
          <label htmlFor="edit-category-description" className={labelClass}>
            الوصف
          </label>

          <textarea
            id="edit-category-description"
            className={`${inputClass} min-h-28 resize-none`}
            placeholder="أدخل وصف التصنيف (اختياري)"
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
          <ErrorText message={errors.description} />
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--erp-border)] pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/categories/${categoryId}`)}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/categories"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        <ArrowRight className="size-4" />
        العودة إلى التصنيفات
      </Link>
    </div>
  )
}
