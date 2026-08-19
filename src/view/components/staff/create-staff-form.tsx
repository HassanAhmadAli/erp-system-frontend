import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useCreateStaff } from "@/hooks/Staff/useCreateStaff"
import { STAFF_ROLES, type StaffRole } from "@/services/staff-service"
import {
  createStaffFormValuesToPayload,
  createStaffSchema,
  createStaffZodErrorToFormErrors,
  type CreateStaffFormErrors,
  type CreateStaffFormValues,
} from "@/validation/staff-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: CreateStaffFormValues = {
  fullName: "",
  fullNameAr: "",
  email: "",
  phoneNumber: "",
  password: "",
  nationalId: "",
  role: "CASHIER",
  jobTitle: "",
  jobTitleAr: "",
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function CreateStaffForm() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const mutation = useCreateStaff()

  const [form, setForm] = useState<CreateStaffFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<CreateStaffFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  function setField<K extends keyof CreateStaffFormValues>(
    key: K,
    value: CreateStaffFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    const validationResult = createStaffSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(createStaffZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      await mutation.mutateAsync(
        createStaffFormValuesToPayload(validationResult.data)
      )

      navigate("/staff")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("pages:staff.createFailed")
      setErrorMessage(message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="staff-fullName" className={labelClass}>
            {t("common:fullName")}
          </label>
          <input
            id="staff-fullName"
            value={form.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            placeholder={t("pages:staff.namePlaceholder")}
            className={inputClass}
            autoComplete="name"
          />
          <ErrorText message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="staff-fullNameAr" className={labelClass}>
            {t("fullNameAr")}
          </label>
          <input
            id="staff-fullNameAr"
            value={form.fullNameAr ?? ""}
            onChange={(event) => setField("fullNameAr", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.fullNameAr} />
        </div>

        <div>
          <label htmlFor="staff-email" className={labelClass}>
            {t("common:email")}
          </label>
          <input
            id="staff-email"
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder={t("common:emailPlaceholder")}
            className={inputClass}
            autoComplete="email"
          />
          <ErrorText message={errors.email} />
        </div>

        <div>
          <label htmlFor="staff-phoneNumber" className={labelClass}>
            {t("common:phoneNumber")}
          </label>
          <input
            id="staff-phoneNumber"
            value={form.phoneNumber}
            onChange={(event) => setField("phoneNumber", event.target.value)}
            placeholder={t("common:phonePlaceholder")}
            className={inputClass}
            autoComplete="tel"
          />
          <ErrorText message={errors.phoneNumber} />
        </div>

        <div>
          <label htmlFor="staff-nationalId" className={labelClass}>
            {t("common:nationalId")}
          </label>
          <input
            id="staff-nationalId"
            value={form.nationalId}
            onChange={(event) => setField("nationalId", event.target.value)}
            placeholder={t("pages:staff.nationalIdPlaceholder")}
            className={inputClass}
          />
          <ErrorText message={errors.nationalId} />
        </div>

        <div>
          <label htmlFor="staff-role" className={labelClass}>
            {t("common:role")}
          </label>
          <select
            id="staff-role"
            value={form.role}
            onChange={(event) =>
              setField("role", event.target.value as StaffRole)
            }
            className={inputClass}
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`, { ns: "common" })}
              </option>
            ))}
          </select>
          <ErrorText message={errors.role} />
        </div>

        <div>
          <label htmlFor="staff-jobTitle" className={labelClass}>
            {t("pages:staff.jobTitle")}
          </label>
          <input
            id="staff-jobTitle"
            value={form.jobTitle}
            onChange={(event) => setField("jobTitle", event.target.value)}
            placeholder={t("common:optional")}
            className={inputClass}
          />
          <ErrorText message={errors.jobTitle} />
        </div>

        <div>
          <label htmlFor="staff-jobTitleAr" className={labelClass}>
            {t("pages:staff.jobTitleAr")}
          </label>
          <input
            id="staff-jobTitleAr"
            value={form.jobTitleAr ?? ""}
            onChange={(event) => setField("jobTitleAr", event.target.value)}
            className={inputClass}
          />
          <ErrorText message={errors.jobTitleAr} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="staff-password" className={labelClass}>
            {t("common:password")}
          </label>
          <input
            id="staff-password"
            type="password"
            value={form.password}
            onChange={(event) => setField("password", event.target.value)}
            placeholder={t("common:passwordPlaceholder")}
            className={inputClass}
            autoComplete="new-password"
          />
          <ErrorText message={errors.password} />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t("common:saving") : t("pages:staff.create")}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/staff")}
        >
          {t("common:cancel")}
        </Button>
      </div>
    </form>
  )
}
