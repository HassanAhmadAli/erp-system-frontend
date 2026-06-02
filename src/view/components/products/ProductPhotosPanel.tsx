import { useState } from "react"

import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { downloadProductPhoto } from "@/services/product-service"
import {
  useDeleteProductPhoto,
  useProductPhotos,
  useUploadProductPhoto,
} from "@/hooks/useProductPhotos"

export function ProductPhotosPanel({ productId }: { productId: number }) {
  const { data, isLoading, error } = useProductPhotos(productId)
  const uploadMutation = useUploadProductPhoto()
  const deleteMutation = useDeleteProductPhoto()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string>("")
  const [deletePhotoId, setDeletePhotoId] = useState<number | string | null>(
    null
  )

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
    } catch (err: any) {
      setMessage(err?.message || "فشل رفع الصورة")
    }
  }

  async function handleDownload(photoId: number | string) {
    setMessage("")
    try {
      const blob = await downloadProductPhoto(photoId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = ""
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setMessage(err?.message || "فشل تحميل الصورة")
    }
  }

  return (
    <section className="space-y-4">
      <div className="text-right">
        <h3 className="text-xl font-bold">صور المنتج</h3>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="space-y-3">
          <label className="block text-right text-sm text-[var(--erp-muted)]">
            رفع صورة
          </label>
          <input
            type="file"
            accept="image/*"
            disabled={uploadMutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              setSelectedFile(file)
            }}
          />

          <button
            className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-60"
            disabled={uploadMutation.isPending}
            type="button"
            onClick={() => void handleUpload()}
          >
            {uploadMutation.isPending ? "جاري الرفع..." : "رفع الصورة"}
          </button>

          {message && (
            <div className="rounded-xl bg-gray-100 p-3 text-sm">{message}</div>
          )}
        </div>
      </div>

      {isLoading && <p className="text-right">جاري تحميل الصور...</p>}
      {error && (
        <p className="rounded-xl bg-red-100 p-3 text-right text-sm text-red-700">
          فشل تحميل الصور
        </p>
      )}

      {!isLoading && !error && (
        <div className="space-y-3">
          {data?.length ? (
            data.map((photo) => (
              <div
                key={String(photo.id)}
                className="flex items-center justify-between gap-3 rounded-2xl border p-3"
              >
                <div className="text-right">
                  <p className="font-semibold">
                    {photo.fileName ?? `Photo ${photo.id}`}
                  </p>
                  <p className="text-xs text-[var(--erp-muted)]">
                    ID: {photo.id}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded bg-blue-600 px-3 py-1 text-white"
                    type="button"
                    onClick={() => void handleDownload(photo.id)}
                  >
                    تحميل
                  </button>
                  <button
                    className="rounded bg-red-600 px-3 py-1 text-white"
                    type="button"
                    onClick={() => setDeletePhotoId(photo.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-right text-sm text-[var(--erp-muted)]">
              لا توجد صور حالياً
            </p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deletePhotoId !== null}
        onClose={() => setDeletePhotoId(null)}
        onConfirm={() => {
          if (deletePhotoId === null) return
          deleteMutation.mutate(deletePhotoId)
          setDeletePhotoId(null)
        }}
      />
    </section>
  )
}
