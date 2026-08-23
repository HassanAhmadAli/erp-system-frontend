import { type FormEvent, useState } from "react"
import { ArrowRight, FolderOpen, UploadCloud } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import {
  createCategory,
  uploadCategoryImage,
} from "@/services/category-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { isAllowedFileType, isWithinMaxFileSize } from "@/validation/helpers"
import {
  categoryFormValuesToPayload,
  categorySchema,
  categoryZodErrorToFormErrors,
  type CategoryFormErrors,
  type CategoryFormValues,
} from "@/validation/category-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const EMPTY_FORM: CategoryFormValues = {
  name: "",
  nameAr: "",
  description: "",
  descriptionAr: "",
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
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<CategoryFormErrors>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error" | ""
    text: string
  }>({ type: "", text: "" })

  function setField(key: keyof CategoryFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function handleFileChange(file: File | null) {
    setSelectedFile(null)
    setMessage({ type: "", text: "" })

    if (!file) return

    if (!isAllowedFileType(file, ALLOWED_IMAGE_TYPES)) {
      setMessage({
        type: "error",
        text: t("common:invalidImageFile"),
      })
      return
    }

    if (!isWithinMaxFileSize(file, MAX_IMAGE_BYTES)) {
      setMessage({
        type: "error",
        text: t("common:imageTooLarge"),
      })
      return
    }

    setSelectedFile(file)
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

      const created = await createCategory(
        categoryFormValuesToPayload(validationResult.data)
      )

      if (selectedFile && created?.id) {
        try {
          await uploadCategoryImage(created.id, selectedFile)
        } catch (error: unknown) {
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? t("pages:categories.createdImageUploadFailedWithError", {
                    error: error.message,
                  })
                : t("pages:categories.createdImageUploadFailed"),
          })

          queryClient.invalidateQueries({
            queryKey: ["categories"],
          })

          onSuccess?.()
          navigate(`/categories/${created.id}/edit`)
          return
        }
      }

      setForm(EMPTY_FORM)
      setSelectedFile(null)

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      })

      setMessage({
        type: "success",
        text: t("pages:categories.createSuccess"),
      })

      onSuccess?.()

      navigate("/categories")
    } catch {
      setMessage({
        type: "error",
        text: t("pages:categories.createFailed"),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:categories.create")}
            </h1>

            <FolderOpen className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:categories.createSubtitle")}
          </p>
        </div>

        <Link
          to="/categories"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
        >
          <ArrowRight className="size-4" />
          {t("pages:categories.backToCategories")}
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
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
            {t("pages:categories.categoryName")}
          </label>

          <input
            id="category-name"
            className={inputClass}
            placeholder={t("pages:categories.namePlaceholder")}
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
          />
          <ErrorText message={errors.name} />
        </div>

        <div>
          <label htmlFor="category-name-ar" className={labelClass}>
            {t("nameAr")}
          </label>

          <input
            id="category-name-ar"
            className={inputClass}
            value={form.nameAr ?? ""}
            onChange={(event) => setField("nameAr", event.target.value)}
          />
          <ErrorText message={errors.nameAr} />
        </div>

        <div>
          <label htmlFor="category-description" className={labelClass}>
            {t("common:description")}
          </label>

          <textarea
            id="category-description"
            className={`${inputClass} min-h-28 resize-none`}
            placeholder={t("pages:categories.descriptionPlaceholder")}
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
          />
          <ErrorText message={errors.description} />
        </div>

        <div>
          <label htmlFor="category-description-ar" className={labelClass}>
            {t("descriptionAr")}
          </label>

          <textarea
            id="category-description-ar"
            className={`${inputClass} min-h-28 resize-none`}
            value={form.descriptionAr ?? ""}
            onChange={(event) => setField("descriptionAr", event.target.value)}
          />
          <ErrorText message={errors.descriptionAr} />
        </div>

        <div>
          <label htmlFor="category-image" className={labelClass}>
            {t("pages:categories.categoryImageOptional")}
          </label>

          <label
            htmlFor="category-image"
            className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-6 text-center transition hover:border-[var(--erp-brand-solid)]/50 hover:bg-[var(--erp-nav-active-bg)]"
          >
            <UploadCloud className="mb-2 size-7 text-[var(--erp-brand-solid)]" />
            <span className="text-sm font-medium text-[var(--erp-text)]">
              {t("common:clickToSelectImage")}
            </span>
            <span className="mt-1 text-xs text-[var(--erp-muted)]">
              {t("common:imageFormats")}
            </span>
            <span
              dir="ltr"
              className="mt-3 max-w-full truncate rounded-full bg-[var(--erp-card)] px-3 py-1 text-xs font-medium text-[var(--erp-text)]"
            >
              {selectedFile?.name
                ? toEnglishDigits(selectedFile.name)
                : t("common:noFileSelected")}
            </span>
            <input
              id="category-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={loading}
              onChange={(event) => {
                handleFileChange(event.target.files?.[0] ?? null)
                event.target.value = ""
              }}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t border-[var(--erp-border)] pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? t("common:adding") : t("pages:categories.create")}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/categories")}
          >
            {t("common:cancel")}
          </Button>
        </div>
      </form>
    </div>
  )
}
