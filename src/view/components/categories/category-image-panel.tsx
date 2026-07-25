import { useState } from "react"
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react"

import {
  useDeleteCategoryImage,
  useUploadCategoryImage,
} from "@/hooks/Categories/useCategoryImage"
import { getCategoryImageSrc } from "@/services/category-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { isAllowedFileType, isWithinMaxFileSize } from "@/validation/helpers"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { Button } from "@/view/components/ui/button"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type CategoryImagePanelProps = {
  categoryId: number
  imageUrl?: string | null
  storedFileId?: string | null
  readOnly?: boolean
}

export function CategoryImagePanel({
  categoryId,
  imageUrl,
  storedFileId,
  readOnly = false,
}: CategoryImagePanelProps) {
  const uploadMutation = useUploadCategoryImage()
  const deleteMutation = useDeleteCategoryImage()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messageTone, setMessageTone] = useState<"success" | "error" | "">("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const currentImageSrc = getCategoryImageSrc(imageUrl, storedFileId)
  const hasImage = Boolean(currentImageSrc)

  function clearSelection() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  function handleFileChange(file: File | null) {
    clearSelection()
    setMessage("")
    setMessageTone("")

    if (!file) return

    if (!isAllowedFileType(file, ALLOWED_IMAGE_TYPES)) {
      setMessageTone("error")
      setMessage("يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP, GIF)")
      return
    }

    if (!isWithinMaxFileSize(file, MAX_IMAGE_BYTES)) {
      setMessageTone("error")
      setMessage("حجم الصورة يجب ألا يتجاوز 5 ميجابايت")
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUpload() {
    setMessage("")
    setMessageTone("")

    if (!selectedFile) {
      setMessageTone("error")
      setMessage("يرجى اختيار صورة أولاً")
      return
    }

    try {
      await uploadMutation.mutateAsync({
        categoryId,
        file: selectedFile,
      })

      clearSelection()
      setMessageTone("success")
      setMessage(
        hasImage ? "تم استبدال صورة التصنيف بنجاح" : "تم رفع صورة التصنيف بنجاح"
      )
    } catch (error: unknown) {
      setMessageTone("error")
      setMessage(error instanceof Error ? error.message : "فشل رفع الصورة")
    }
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(categoryId, {
      onSuccess: () => {
        setConfirmDelete(false)
        setMessageTone("success")
        setMessage("تم حذف صورة التصنيف بنجاح")
      },
      onError: (error: unknown) => {
        setMessageTone("error")
        setMessage(error instanceof Error ? error.message : "فشل حذف الصورة")
      },
    })
  }

  return (
    <section className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-end gap-2">
        <div>
          <h3 className="text-xl font-semibold text-[var(--erp-text)]">
            صورة التصنيف
          </h3>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {readOnly
              ? "عرض صورة التصنيف المرتبطة."
              : "يمكنك رفع صورة واحدة للتصنيف أو استبدالها أو حذفها."}
          </p>
        </div>
        <ImageIcon className="size-5 text-[var(--erp-brand-solid)]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
          {previewUrl || currentImageSrc ? (
            <img
              src={previewUrl ?? currentImageSrc!}
              alt="صورة التصنيف"
              className="max-h-56 w-full rounded-xl object-contain"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto size-12 text-[var(--erp-muted)]" />
              <p className="mt-3 text-sm text-[var(--erp-muted)]">
                لا توجد صورة لهذا التصنيف
              </p>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="space-y-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
            <label
              htmlFor={`category-image-upload-${categoryId}`}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-8 text-center transition hover:border-[var(--erp-brand-solid)]/50 hover:bg-[var(--erp-nav-active-bg)] ${
                uploadMutation.isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <UploadCloud className="mb-3 size-8 text-[var(--erp-brand-solid)]" />
              <span className="text-sm font-medium text-[var(--erp-text)]">
                انقر لاختيار صورة
              </span>
              <span className="mt-1 text-xs text-[var(--erp-muted)]">
                JPG, PNG, WEBP, GIF — حتى 5MB
              </span>
              <span
                dir="ltr"
                className="mt-3 max-w-full truncate rounded-full bg-[var(--erp-bg)] px-3 py-1 text-xs font-medium text-[var(--erp-text)]"
              >
                {selectedFile?.name
                  ? toEnglishDigits(selectedFile.name)
                  : "No file selected"}
              </span>
              <input
                id={`category-image-upload-${categoryId}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                disabled={uploadMutation.isPending}
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0] ?? null)
                  event.target.value = ""
                }}
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                className="gap-2"
                disabled={uploadMutation.isPending || !selectedFile}
                onClick={() => void handleUpload()}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" />
                    {hasImage ? "استبدال الصورة" : "رفع الصورة"}
                  </>
                )}
              </Button>

              {hasImage && (
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  disabled={
                    deleteMutation.isPending || uploadMutation.isPending
                  }
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                  حذف الصورة
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {message && (
        <div
          className={
            messageTone === "error"
              ? "flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300"
              : "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          }
        >
          {messageTone === "error" && (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{toEnglishDigits(message)}</span>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="حذف صورة التصنيف"
        description="هل أنت متأكد من حذف صورة هذا التصنيف؟ لا يمكن التراجع عن هذه العملية."
        confirmLabel="حذف الصورة"
        cancelLabel="إلغاء"
        isLoading={deleteMutation.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
