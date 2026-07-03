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

import {
  useDeleteProductPhoto,
  useProductPhotos,
  useUploadProductPhoto,
} from "@/hooks/Products/useProductPhotos"
import { downloadProductPhoto } from "@/services/product-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { Button } from "@/view/components/ui/button"

export function ProductPhotosPanel({ productId }: { productId: number }) {
  const { data, isLoading, error } = useProductPhotos(productId)
  const uploadMutation = useUploadProductPhoto()
  const deleteMutation = useDeleteProductPhoto()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [deletePhotoId, setDeletePhotoId] = useState<number | string | null>(
    null
  )

  const photos = data ?? []

  async function handleUpload() {
    setMessage("")

    if (!selectedFile) {
      setMessage("يرجى اختيار صورة أولاً")
      return
    }

    try {
      await uploadMutation.mutateAsync({
        productId,
        file: selectedFile,
      })

      setSelectedFile(null)
      setMessage("تم رفع الصورة بنجاح")
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "فشل رفع الصورة")
    }
  }

  async function handleDownload(photoId: number | string, fileName?: string) {
    setMessage("")

    try {
      const blob = await downloadProductPhoto(photoId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = fileName?.trim() || `product-photo-${photoId}`
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "فشل تحميل الصورة")
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
    <section className="space-y-5">
      <div className="flex items-center gap-2 text-right">
        <ImageIcon className="size-5 text-[var(--erp-accent)]" />

        <div>
          <h3 className="text-xl font-bold text-[var(--erp-text)]">
            صور المنتج
          </h3>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            يمكنك رفع الصور الخاصة بالمنتج أو تحميلها أو حذفها.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label
              htmlFor="photo-upload"
              className="block text-right text-sm font-medium text-[var(--erp-muted)]"
            >
              رفع صورة جديدة
            </label>

            <label
              htmlFor="photo-upload"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-8 text-center transition hover:border-[var(--erp-accent)]/50 hover:bg-[var(--erp-nav-active-bg)] ${
                uploadMutation.isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <UploadCloud className="mb-3 size-8 text-[var(--erp-accent)]" />

              <span className="text-sm font-medium text-[var(--erp-text)]">
                انقر لاختيار صورة
              </span>

              <span className="mt-1 text-xs text-[var(--erp-muted)]">
                يدعم ملفات الصور فقط
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
                id="photo-upload"
                type="file"
                accept="image/*"
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
                جاري الرفع...
              </>
            ) : (
              <>
                <UploadCloud className="size-4" />
                رفع الصورة
              </>
            )}
          </Button>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-3 text-right text-sm text-[var(--erp-text)]">
            {toEnglishDigits(message)}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)]">
          <Loader2 className="size-7 animate-spin text-[var(--erp-accent)]" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-right text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />

          <div>
            <p className="font-semibold">فشل تحميل الصور</p>
            <p className="mt-1 text-red-700/80 dark:text-red-300/80">
              حدث خطأ أثناء جلب صور المنتج.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !error && photos.length === 0 && (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <FileImage className="size-12 text-[var(--erp-muted)]" />

          <h4 className="mt-4 text-lg font-semibold text-[var(--erp-text)]">
            لا توجد صور حالياً
          </h4>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            قم برفع أول صورة لهذا المنتج من الأعلى.
          </p>
        </div>
      )}

      {!isLoading && !error && photos.length > 0 && (
        <div className="grid gap-3">
          {photos.map((photo) => (
            <article
              key={String(photo.id)}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3 text-right">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--erp-accent)]/10 text-[var(--erp-accent)]">
                  <FileImage className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--erp-text)]">
                    {photo.fileName
                      ? toEnglishDigits(photo.fileName)
                      : `Photo ${toEnglishDigits(String(photo.id))}`}
                  </p>

                  <p
                    dir="ltr"
                    className="mt-1 text-left text-xs text-[var(--erp-muted)]"
                  >
                    ID: {toEnglishDigits(String(photo.id))}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    void handleDownload(photo.id, photo.fileName ?? undefined)
                  }
                >
                  <Download className="size-4" />
                  تحميل
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 border-red-500/20 text-red-600 hover:bg-red-500/10 dark:text-red-300"
                  disabled={deleteMutation.isPending}
                  onClick={() => setDeletePhotoId(photo.id)}
                >
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deletePhotoId !== null}
        title="حذف الصورة"
        description="هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذه العملية."
        confirmLabel="حذف الصورة"
        cancelLabel="إلغاء"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeletePhotoId(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}