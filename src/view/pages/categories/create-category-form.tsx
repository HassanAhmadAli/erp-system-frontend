import { type FormEvent, useState } from "react"
import { ArrowRight, FolderOpen } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import { createCategory } from "@/services/category-service"
import {
  categoryFormValuesToPayload,
  categorySchema,
  categoryZodErrorToFormErrors,
  type CategoryFormErrors,
  type CategoryFormValues,
} from "@/validation/category-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: CategoryFormValues = {
  name: "",
  description: "",
}

type CreateCategoryFormProps = {
  onSuccess?: () => void
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<CategoryFormErrors>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error" | ""
    text: string
  }>({ type: "", text: "" })

  function setField(key: keyof CategoryFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage({ type: "", text: "" })

    const validationResult = categorySchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(categoryZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      setLoading(true)

      await createCategory(categoryFormValuesToPayload(validationResult.data))

      setForm(EMPTY_FORM)

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      })

      setMessage({
        type: "success",
        text: "تم إضافة التصنيف بنجاح",
      })

      onSuccess?.()

      navigate("/categories")
    } catch {
      setMessage({
        type: "error",
        text: "فشل إضافة التصنيف، حاول مرة أخرى",
      })
    } finally {
      setLoading(false)
    }
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
              إضافة تصنيف
            </h1>

            <FolderOpen className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أضف تصنيفًا جديدًا لتنظيم المنتجات داخل المخزون.
          </p>
        </div>

        <Link
          to="/categories"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          العودة إلى التصنيفات
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
      >
        {message.text && (
          <div
            className={
              message.type === "success"
                ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
            }
          >
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="category-name" className={labelClass}>
            اسم التصنيف
          </label>

          <input
            id="category-name"
            className={inputClass}
            placeholder="أدخل اسم التصنيف"
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          <ErrorText message={errors.name} />
        </div>

        <div>
          <label htmlFor="category-description" className={labelClass}>
            الوصف
          </label>

          <textarea
            id="category-description"
            className={`${inputClass} min-h-28 resize-none`}
            placeholder="أدخل وصف التصنيف (اختياري)"
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
          <ErrorText message={errors.description} />
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--erp-border)] pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة التصنيف"}
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
