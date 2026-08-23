import { useState } from "react"
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  useDeleteCategoryImage,
  useUploadCategoryImage,
} from "@/hooks/Categories/useCategoryImage"
import { getCategoryImageSrc } from "@/services/category-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { isAllowedFileType, isWithinMaxFileSize } from "@/validation/helpers"
import { EntityImage } from "@/view/components/common/entity-image"
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
  const { t } = useTranslation(["common", "pages"])
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
      setMessage(t("common:invalidImageFile"))
      return
    }

    if (!isWithinMaxFileSize(file, MAX_IMAGE_BYTES)) {
      setMessageTone("error")
      setMessage(t("common:imageTooLarge"))
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
      setMessage(t("common:selectImageFirst"))
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
        hasImage
          ? t("pages:categories.imageReplaced")
          : t("pages:categories.imageUploaded")
      )
    } catch (error: unknown) {
      setMessageTone("error")
      setMessage(
        error instanceof Error ? error.message : t("common:imageUploadFailed")
      )
    }
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(categoryId, {
      onSuccess: () => {
        setConfirmDelete(false)
        setMessageTone("success")
        setMessage(t("pages:categories.imageDeleted"))
      },
      onError: (error: unknown) => {
        setMessageTone("error")
        setMessage(
          error instanceof Error ? error.message : t("common:imageUploadFailed")
        )
      },
    })
  }

  return (
    <section className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-end gap-2">
        <div>
          <h3 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("pages:categories.categoryImage")}
          </h3>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {readOnly
              ? t("pages:categories.categoryImageViewHint")
              : t("pages:categories.categoryImageManageHint")}
          </p>
        </div>
        <ImageIcon className="size-5 text-[var(--erp-brand-solid)]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
          {previewUrl || currentImageSrc ? (
            <EntityImage
              src={previewUrl ?? currentImageSrc}
              alt={t("pages:categories.categoryImage")}
              className="max-h-56 w-full rounded-xl object-contain"
              fallbackIconClassName="size-12"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto size-12 text-[var(--erp-muted)]" />
              <p className="mt-3 text-sm text-[var(--erp-muted)]">
                {t("pages:categories.noCategoryImage")}
              </p>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="space-y-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
            <label
              htmlFor={`category-image-upload-${categoryId}`}
              className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-8 text-center transition hover:border-[var(--erp-brand-solid)]/50 hover:bg-[var(--erp-nav-active-bg)] ${
                uploadMutation.isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <UploadCloud className="mb-3 size-8 text-[var(--erp-brand-solid)]" />
              <span className="text-sm font-medium text-[var(--erp-text)]">
                {t("common:clickToSelectImage")}
              </span>
              <span className="mt-1 text-xs text-[var(--erp-muted)]">
                {t("common:imageFormats")}
              </span>
              <span
                dir="ltr"
                className="mt-3 max-w-full truncate rounded-full bg-[var(--erp-bg)] px-3 py-1 text-xs font-medium text-[var(--erp-text)]"
              >
                {selectedFile?.name
                  ? toEnglishDigits(selectedFile.name)
                  : t("common:noFileSelected")}
              </span>
              <input
                id={`category-image-upload-${categoryId}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
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
                    {t("common:uploading")}
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" />
                    {hasImage
                      ? t("common:replaceImage")
                      : t("common:uploadImage")}
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
                  {t("common:deleteImage")}
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
        title={t("pages:categories.deleteCategoryImage")}
        description={t("pages:categories.deleteCategoryImageConfirm")}
        confirmLabel={t("common:deleteImage")}
        cancelLabel={t("common:cancel")}
        isLoading={deleteMutation.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
