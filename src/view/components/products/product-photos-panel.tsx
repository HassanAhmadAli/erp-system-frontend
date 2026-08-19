import { useState } from "react"
import {
  AlertCircle,
  Download,
  FileImage,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  useDeleteProductPhoto,
  useProductPhotos,
  useUploadProductPhoto,
} from "@/hooks/Products/useProductPhotos"
import {
  downloadProductPhoto,
  getProductPhotoFileName,
  getProductPhotoSrc,
  getProductPhotoStoredFileId,
  type ProductPhoto,
} from "@/services/product-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { Button } from "@/view/components/ui/button"

type ProductPhotosPanelProps = {
  productId: number
  readOnly?: boolean
}

function ProductPhotoImage({
  photo,
  alt,
}: {
  photo: ProductPhoto
  alt: string
}) {
  const src = getProductPhotoSrc(photo)

  if (!src) {
    return (
      <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-[var(--erp-muted)]">
        <FileImage className="size-10" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-h-56 w-full rounded-xl object-contain"
    />
  )
}

export function ProductPhotosPanel({
  productId,
  readOnly = false,
}: ProductPhotosPanelProps) {
  const { t } = useTranslation(["common", "pages"])
  const { data, isLoading, error } = useProductPhotos(productId)
  const uploadMutation = useUploadProductPhoto()
  const deleteMutation = useDeleteProductPhoto()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null)

  const photos = data ?? []

  async function handleUpload() {
    setMessage("")

    if (!selectedFile) {
      setMessage(t("common:selectImageFirst"))
      return
    }

    try {
      await uploadMutation.mutateAsync({
        productId,
        file: selectedFile,
      })

      setSelectedFile(null)
      setMessage(t("pages:products.uploadSuccess"))
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : t("common:imageUploadFailed")
      )
    }
  }

  async function handleDownload(photo: ProductPhoto) {
    setMessage("")

    const storedFileId = getProductPhotoStoredFileId(photo)
    if (!storedFileId) {
      setMessage(t("common:downloadFailed"))
      return
    }

    try {
      const blob = await downloadProductPhoto(storedFileId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const fileName = getProductPhotoFileName(photo)

      link.href = url
      link.download = fileName || `product-photo-${storedFileId}`
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : t("common:downloadFailed")
      )
    }
  }

  function handleConfirmDelete() {
    if (deletePhotoId === null) return

    deleteMutation.mutate(deletePhotoId, {
      onSuccess: () => {
        setDeletePhotoId(null)
      },
    })
  }

  return (
    <section className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-5 text-[var(--erp-accent)]" />

        <div>
          <h3 className="text-xl font-bold text-[var(--erp-text)]">
            {t("pages:products.photos")}
          </h3>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {readOnly
              ? t("pages:products.photosViewHint")
              : t("pages:products.photosSubtitle")}
          </p>
        </div>
      </div>

      {!readOnly && (
        <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-2">
              <label
                htmlFor="photo-upload"
                className="block text-sm font-medium text-[var(--erp-muted)]"
              >
                {t("pages:products.uploadNewPhoto")}
              </label>

              <label
                htmlFor="photo-upload"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-8 text-center transition hover:border-[var(--erp-accent)]/50 hover:bg-[var(--erp-nav-active-bg)] ${
                  uploadMutation.isPending
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                <UploadCloud className="mb-3 size-8 text-[var(--erp-accent)]" />

                <span className="text-sm font-medium text-[var(--erp-text)]">
                  {t("common:clickToSelectImage")}
                </span>

                <span className="mt-1 text-xs text-[var(--erp-muted)]">
                  {t("common:imageFilesOnly")}
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
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={uploadMutation.isPending}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setSelectedFile(file)
                    setMessage("")
                  }}
                />
              </label>
            </div>

            <Button
              type="button"
              className="w-full gap-2 lg:w-auto"
              disabled={uploadMutation.isPending}
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
                  {t("common:uploadImage")}
                </>
              )}
            </Button>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-3 text-sm text-[var(--erp-text)]">
              {toEnglishDigits(message)}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)]">
          <Loader2 className="size-7 animate-spin text-[var(--erp-accent)]" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />

          <div>
            <p className="font-semibold">
              {t("pages:products.loadPhotosFailed")}
            </p>
            <p className="mt-1 text-red-700/80 dark:text-red-300/80">
              {t("pages:products.loadPhotosFailedHint")}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && photos.length === 0 && (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <ImageIcon className="size-12 text-[var(--erp-muted)]" />

          <h4 className="mt-4 text-lg font-semibold text-[var(--erp-text)]">
            {t("pages:products.noPhotos")}
          </h4>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {readOnly
              ? t("pages:products.noPhotosViewHint")
              : t("pages:products.uploadFirstPhotoHint")}
          </p>
        </div>
      )}

      {!isLoading && !error && photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const fileName = getProductPhotoFileName(photo)
            const label = fileName
              ? toEnglishDigits(fileName)
              : t("pages:products.photoLabel", {
                  id: toEnglishDigits(String(photo.id)),
                })

            return (
              <article
                key={String(photo.id)}
                className="overflow-hidden rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)]"
              >
                <div className="flex min-h-[220px] items-center justify-center overflow-hidden border-b border-dashed border-[var(--erp-border)] p-4">
                  <ProductPhotoImage photo={photo} alt={label} />
                </div>

                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--erp-text)]">
                      {label}
                    </p>
                    <p
                      dir="ltr"
                      className="mt-1 text-left text-xs text-[var(--erp-muted)]"
                    >
                      ID: {toEnglishDigits(String(photo.id))}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => void handleDownload(photo)}
                    >
                      <Download className="size-4" />
                      {t("common:download")}
                    </Button>

                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2 border-red-500/20 text-red-600 hover:bg-red-500/10 dark:text-red-300"
                        disabled={deleteMutation.isPending}
                        onClick={() => setDeletePhotoId(photo.id)}
                      >
                        <Trash2 className="size-4" />
                        {t("common:delete")}
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {!readOnly && (
        <ConfirmDialog
          open={deletePhotoId !== null}
          title={t("common:deleteImage")}
          description={t("pages:products.deletePhotoConfirm")}
          confirmLabel={t("common:deleteImage")}
          cancelLabel={t("common:cancel")}
          isLoading={deleteMutation.isPending}
          onClose={() => setDeletePhotoId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  )
}
