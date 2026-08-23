import { ArrowRight, Save, UploadCloud } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useCreateAd } from "@/hooks/useAds"
import { uploadAdImage } from "@/services/ads-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import {
  isAllowedFileType,
  isValidId,
  isWithinMaxFileSize,
} from "@/validation/helpers"
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

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function CreateAdPage() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createAdMutation = useCreateAd()

  const [title, setTitle] = useState("")
  const [titleAr, setTitleAr] = useState("")
  const [description, setDescription] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [placement, setPlacement] = useState<AdPlacement>("HOME")
  const [isActive, setIsActive] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<AdFormErrors>({})
  const [formError, setFormError] = useState("")

  function handleFileChange(file: File | null) {
    setSelectedFile(null)
    setFormError("")

    if (!file) return

    if (!isAllowedFileType(file, ALLOWED_IMAGE_TYPES)) {
      setFormError(t("common:invalidImageFile"))
      return
    }

    if (!isWithinMaxFileSize(file, MAX_IMAGE_BYTES)) {
      setFormError(t("common:imageTooLarge"))
      return
    }

    setSelectedFile(file)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setFormErrors({})

    const validation = adSchema.safeParse({
      title,
      titleAr,
      description,
      descriptionAr,
      imageUrl: "",
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

    try {
      const created = await createAdMutation.mutateAsync(
        adFormValuesToPayload(validation.data)
      )

      if (selectedFile && isValidId(created?.id)) {
        try {
          await uploadAdImage(created.id, selectedFile)
          void queryClient.invalidateQueries({ queryKey: ["ads"] })
          void queryClient.invalidateQueries({
            queryKey: ["ads", created.id],
          })
        } catch (error: unknown) {
          setFormError(
            error instanceof Error
              ? t("ads.createdImageUploadFailedWithError", {
                  ns: "pages",
                  error: error.message,
                })
              : t("ads.createdImageUploadFailed", { ns: "pages" })
          )
          navigate(`/ads/${created.id}`, { replace: true })
          return
        }
      }

      navigate("/ads")
    } catch {
      setFormError(t("ads.createFailed", { ns: "pages" }))
    }
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

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="ad-image"
              className="text-sm font-medium text-[var(--erp-text)]"
            >
              {t("ads.adImageOptional", { ns: "pages" })}
            </label>

            <label
              htmlFor="ad-image"
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
                id="ad-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={createAdMutation.isPending}
                onChange={(event) => {
                  handleFileChange(event.target.files?.[0] ?? null)
                  event.target.value = ""
                }}
              />
            </label>
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
