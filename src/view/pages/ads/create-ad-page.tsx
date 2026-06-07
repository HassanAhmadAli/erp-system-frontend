import { ArrowRight, Save } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateAd } from "@/hooks/useAds"
import { Button } from "@/view/components/ui/button"

function toIsoDateTime(value: string) {
  if (!value) return ""

  return new Date(value).toISOString()
}

export function CreateAdPage() {
  const navigate = useNavigate()
  const createAdMutation = useCreateAd()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [placement, setPlacement] = useState<"HOME">("HOME")
  const [isActive, setIsActive] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [formError, setFormError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")

    if (!title.trim()) {
      setFormError("عنوان الإعلان مطلوب.")
      return
    }

    if (!description.trim()) {
      setFormError("وصف الإعلان مطلوب.")
      return
    }

    if (!startDate) {
      setFormError("تاريخ بداية الإعلان مطلوب.")
      return
    }

    if (!endDate) {
      setFormError("تاريخ نهاية الإعلان مطلوب.")
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setFormError("تاريخ النهاية يجب أن يكون بعد تاريخ البداية.")
      return
    }

    createAdMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || null,
        linkUrl: linkUrl.trim() || null,
        placement,
        isActive,
        startDate: toIsoDateTime(startDate),
        endDate: toIsoDateTime(endDate),
      },
      {
        onSuccess: () => {
          navigate("/ads")
        },
        onError: () => {
          setFormError("حدث خطأ أثناء إنشاء الإعلان.")
        },
      }
    )
  }

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            إضافة إعلان
          </h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            أنشئ إعلانًا جديدًا ليظهر داخل النظام.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/ads")}
        >
          <ArrowRight className="size-4" />
          رجوع
        </Button>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              عنوان الإعلان
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: عرض الصيف"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              الوصف
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="اكتب وصف الإعلان هنا..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              رابط الصورة
            </label>

            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              رابط الإعلان
            </label>

            <input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              مكان الظهور
            </label>

            <select
              value={placement}
              onChange={(event) => setPlacement(event.target.value as "HOME")}
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            >
              <option value="HOME">الصفحة الرئيسية</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              الحالة
            </label>

            <select
              value={isActive ? "active" : "inactive"}
              onChange={(event) => setIsActive(event.target.value === "active")}
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              تاريخ البداية
            </label>

            <input
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              تاريخ النهاية
            </label>

            <input
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none focus:border-[var(--erp-brand-solid)]"
            />
          </div>
        </div>

        {formError && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/ads")}
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            className="gap-2"
            disabled={createAdMutation.isPending}
          >
            <Save className="size-4" />
            {createAdMutation.isPending ? "جاري الحفظ..." : "حفظ الإعلان"}
          </Button>
        </div>
      </form>
    </main>
  )
}