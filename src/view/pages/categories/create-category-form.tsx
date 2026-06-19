import { type FormEvent, useState } from "react"
import { ArrowRight, FolderOpen } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import { createCategory } from "@/services/category-service"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

type CreateCategoryFormProps = {
  onSuccess?: () => void
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error" | ""
    text: string
  }>({ type: "", text: "" })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage({ type: "", text: "" })

    if (!name.trim()) {
      setMessage({ type: "error", text: "اسم التصنيف مطلوب" })
      return
    }

    try {
      setLoading(true)

      await createCategory({
        name: name.trim(),
        description: description.trim(),
      })

      setName("")
      setDescription("")

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
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category-description" className={labelClass}>
            الوصف
          </label>

          <textarea
            id="category-description"
            className={`${inputClass} min-h-28 resize-none`}
            placeholder="أدخل وصف التصنيف (اختياري)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
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
