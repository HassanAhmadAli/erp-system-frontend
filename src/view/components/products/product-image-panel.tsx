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
  useDeleteProductImage,
  useProductPhotos,
  useUploadProductPhoto,
} from "@/hooks/Products/useProductPhotos"
import {
  getProductImageSrc,
  getProductStoredFileId,
} from "@/services/product-service"
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

type ProductImagePanelProps = {
  productId: number
  imageUrl?: string | null
  storedFileId?: string | null
  title?: string
  readOnly?: boolean
}

export function ProductImagePanel({
  productId,
  imageUrl,
  storedFileId,
  title,
  readOnly = false,
}: ProductImagePanelProps) {
  const { t } = useTranslation(["common", "pages"])
  const { data: photos } = useProductPhotos(productId)
  const uploadMutation = useUploadProductPhoto()
  const deleteMutation = useDeleteProductImage()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messageTone, setMessageTone] = useState<"success" | "error" | "">("")
  const [confirmDelete, setConfirmDelete] = useState(false)

  const liveStoredFileId =
    getProductStoredFileId(imageUrl, photos) ?? storedFileId
  const currentImageSrc = getProductImageSrc(imageUrl, liveStoredFileId)
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
        productId,
        file: selectedFile,
      })

      clearSelection()
      setMessageTone("success")
      setMessage(
        hasImage
          ? t("pages:products.imageReplaced")
          : t("pages:products.imageUploaded")
      )
    } catch (error: unknown) {
      setMessageTone("error")
      setMessage(
        error instanceof Error ? error.message : t("common:imageUploadFailed")
      )
    }
  }

  function handleConfirmDelete() {
    deleteMutation.mutate(productId, {
      onSuccess: () => {
        setConfirmDelete(false)
        setMessageTone("success")
        setMessage(t("pages:products.imageDeleted"))
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
    <section className="@container space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-end gap-2">
        <div>
          <h3 className="text-xl font-semibold text-[var(--erp-text)]">
            {t("pages:products.productImage")}
          </h3>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {readOnly
              ? t("pages:products.productImageViewHint")
              : t("pages:products.productImageManageHint")}
          </p>
        </div>
        <ImageIcon className="size-5 text-[var(--erp-brand-solid)]" />
      </div>

      <div className="grid min-w-0 gap-4 @[32rem]:grid-cols-2">
        <div className="flex min-h-[220px] min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
          {previewUrl || currentImageSrc ? (
            <EntityImage
              key={currentImageSrc ?? "empty"}
              src={previewUrl ?? currentImageSrc}
              alt={title || t("pages:products.productImage")}
              className="max-h-56 w-full rounded-xl object-contain"
              fallbackIconClassName="size-12"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto size-12 text-[var(--erp-muted)]" />
              <p className="mt-3 text-sm text-[var(--erp-muted)]">
                {t("pages:products.noProductImage")}
              </p>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="min-w-0 space-y-4 overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
            <label
              htmlFor={`product-image-upload-${productId}`}
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
                id={`product-image-upload-${productId}`}
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

            <div className="flex min-w-0 flex-col gap-2">
              <Button
                type="button"
                className="w-full min-w-0 gap-2"
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
                  className="w-full min-w-0 gap-2"
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
        title={t("pages:products.deleteProductImage")}
        description={t("pages:products.deleteProductImageConfirm")}
        confirmLabel={t("common:deleteImage")}
        cancelLabel={t("common:cancel")}
        isLoading={deleteMutation.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
