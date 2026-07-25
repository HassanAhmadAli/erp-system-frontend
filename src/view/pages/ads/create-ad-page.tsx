import { ArrowRight, Save } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateAd } from "@/hooks/useAds"
import {
  AD_PLACEMENTS,
  adFormValuesToPayload,
  adSchema,
  adZodErrorToFormErrors,
  type AdFormErrors,
  type AdPlacement,
} from "@/validation/ad-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-3 text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const dateInputClass = `${inputClass} text-left [direction:ltr]`

const placementLabels: Record<AdPlacement, string> = {
  HOME: "الصفحة الرئيسية",
  CHECKOUT: "صفحة الدفع",
  SIDEBAR: "الشريط الجانبي",
}

export function CreateAdPage() {
  const navigate = useNavigate()
  const createAdMutation = useCreateAd()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [placement, setPlacement] = useState<AdPlacement>("HOME")
  const [isActive, setIsActive] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [formErrors, setFormErrors] = useState<AdFormErrors>({})
  const [formError, setFormError] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setFormErrors({})

    const validation = adSchema.safeParse({
      title,
      description,
      imageUrl,
      linkUrl,
      placement,
      isActive,
      startDate,
      endDate,
    })

    if (!validation.success) {
      setFormErrors(adZodErrorToFormErrors(validation.error))
      return
    }

    createAdMutation.mutate(adFormValuesToPayload(validation.data), {
      onSuccess: () => {
        navigate("/ads")
      },
      onError: () => {
        setFormError("حدث خطأ أثناء إنشاء الإعلان.")
      },
    })
  }

  return (
    <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
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
        className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
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
              className={inputClass}
            />

            {formErrors.title && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.title}
              </p>
            )}
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
              className={`${inputClass} resize-none`}
            />

            {formErrors.description && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              رابط الصورة
            </label>

            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/image.png"
              className={`${inputClass} text-left [direction:ltr]`}
            />

            {formErrors.imageUrl && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.imageUrl}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              رابط الإعلان
            </label>

            <input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://example.com"
              className={`${inputClass} text-left [direction:ltr]`}
            />

            {formErrors.linkUrl && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.linkUrl}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              مكان الظهور
            </label>

            <select
              value={placement}
              onChange={(event) =>
                setPlacement(event.target.value as AdPlacement)
              }
              className={inputClass}
            >
              {AD_PLACEMENTS.map((placementOption) => (
                <option key={placementOption} value={placementOption}>
                  {placementLabels[placementOption]}
                </option>
              ))}
            </select>

            {formErrors.placement && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.placement}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              الحالة
            </label>

            <select
              value={isActive ? "active" : "inactive"}
              onChange={(event) => setIsActive(event.target.value === "active")}
              className={inputClass}
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>

            {formErrors.isActive && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.isActive}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              تاريخ البداية
            </label>

            <input
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={dateInputClass}
            />

            {formErrors.startDate && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.startDate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              تاريخ النهاية
            </label>

            <input
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={dateInputClass}
            />

            {formErrors.endDate && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.endDate}
              </p>
            )}
          </div>
        </div>

        {formError && (
          <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {formError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-[var(--erp-border)] pt-4">
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