import { ArrowRight, Save } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

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

export function CreateAdPage() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const createAdMutation = useCreateAd()

  const [title, setTitle] = useState("")
  const [titleAr, setTitleAr] = useState("")
  const [description, setDescription] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
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
      titleAr,
      description,
      descriptionAr,
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
        setFormError(t("ads.createFailed", { ns: "pages" }))
      },
    })
  }

  return (
    <main className="space-y-6 text-[var(--erp-text)]">
      <section className="flex items-center justify-between gap-4">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            {t("ads.create", { ns: "pages" })}
          </h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("ads.createSubtitle", { ns: "pages" })}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => navigate("/ads")}
        >
          <ArrowRight className="size-4" />
          {t("back")}
        </Button>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              {t("ads.adTitle", { ns: "pages" })}
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("ads.titlePlaceholder", { ns: "pages" })}
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
              {t("titleAr")}
            </label>

            <input
              value={titleAr}
              onChange={(event) => setTitleAr(event.target.value)}
              className={inputClass}
            />

            {formErrors.titleAr && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.titleAr}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              {t("description")}
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("ads.descriptionPlaceholder", { ns: "pages" })}
              rows={4}
              className={`${inputClass} resize-none`}
            />

            {formErrors.description && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              {t("descriptionAr")}
            </label>

            <textarea
              value={descriptionAr}
              onChange={(event) => setDescriptionAr(event.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
            />

            {formErrors.descriptionAr && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.descriptionAr}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              {t("ads.imageUrl", { ns: "pages" })}
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
              {t("ads.linkUrl", { ns: "pages" })}
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
              {t("ads.placement", { ns: "pages" })}
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
                  {t(`ads.placements.${placementOption}`, { ns: "pages" })}
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
              {t("status")}
            </label>

            <select
              value={isActive ? "active" : "inactive"}
              onChange={(event) => setIsActive(event.target.value === "active")}
              className={inputClass}
            >
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>

            {formErrors.isActive && (
              <p className="text-sm text-red-500 dark:text-red-300">
                {formErrors.isActive}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--erp-text)]">
              {t("startDate")}
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
              {t("endDate")}
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
            {t("cancel")}
          </Button>

          <Button
            type="submit"
            className="gap-2"
            disabled={createAdMutation.isPending}
          >
            <Save className="size-4" />
            {createAdMutation.isPending ? t("saving") : t("saveAd")}
          </Button>
        </div>
      </form>
    </main>
  )
}
