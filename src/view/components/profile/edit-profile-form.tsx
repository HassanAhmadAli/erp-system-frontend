import { type FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useUpdateCurrentProfile } from "@/hooks/useUpdateLanguage"
import {
  updateProfileFormValuesToPayload,
  updateProfileSchema,
  updateProfileZodErrorToFormErrors,
  type UpdateProfileFormErrors,
  type UpdateProfileFormValues,
} from "@/validation/profile-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: UpdateProfileFormValues = {
  fullName: "",
  fullNameAr: "",
  email: "",
  phoneNumber: "",
  nationalId: "",
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function EditProfileForm() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { data: user, isLoading, isError, refetch } = useCurrentUser()
  const updateProfile = useUpdateCurrentProfile()

  const [form, setForm] = useState<UpdateProfileFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<UpdateProfileFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!user) return

    setForm({
      fullName: user.fullName ?? "",
      fullNameAr: user.fullNameAr ?? "",
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? "",
      nationalId: user.nationalId ?? "",
    })
    setErrors({})
    setErrorMessage("")
  }, [user])

  function setField(key: keyof UpdateProfileFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    const validationResult = updateProfileSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(updateProfileZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      await updateProfile.mutateAsync(
        updateProfileFormValuesToPayload(validationResult.data)
      )
      navigate("/profile")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("pages:profile.updateFailed")
      setErrorMessage(message)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        {t("pages:profile.loading")}
      </section>
    )
  }

  if (isError || !user) {
    return (
      <section className="space-y-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-start text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        <p>{t("pages:profile.loadFailed")}</p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          {t("common:retry")}
        </Button>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
    >
      <p className="text-sm text-[var(--erp-muted)]">
        {t("pages:profile.personalInfoHint")}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="profile-fullName" className={labelClass}>
            {t("common:fullName")}
          </label>
          <input
            id="profile-fullName"
            value={form.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="profile-fullNameAr" className={labelClass}>
            {t("common:fullNameAr")}
          </label>
          <input
            id="profile-fullNameAr"
            value={form.fullNameAr ?? ""}
            onChange={(event) => setField("fullNameAr", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.fullNameAr} />
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>
            {t("common:email")}
          </label>
          <input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.email} />
        </div>

        <div>
          <label htmlFor="profile-phoneNumber" className={labelClass}>
            {t("common:phoneNumber")}
          </label>
          <input
            id="profile-phoneNumber"
            value={form.phoneNumber}
            onChange={(event) => setField("phoneNumber", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.phoneNumber} />
        </div>

        <div>
          <label htmlFor="profile-nationalId" className={labelClass}>
            {t("common:nationalId")}
          </label>
          <input
            id="profile-nationalId"
            value={form.nationalId}
            onChange={(event) => setField("nationalId", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.nationalId} />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending
            ? t("common:saving")
            : t("common:saveChanges")}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/profile")}
        >
          {t("common:cancel")}
        </Button>
      </div>
    </form>
  )
}
