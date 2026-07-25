import { type FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useStaffById } from "@/hooks/Staff/useStaffById"
import { useUpdateStaff } from "@/hooks/Staff/useUpdateStaff"
import { isValidId } from "@/validation/helpers"
import {
  updateStaffFormValuesToPayload,
  updateStaffSchema,
  updateStaffZodErrorToFormErrors,
  type UpdateStaffFormErrors,
  type UpdateStaffFormValues,
} from "@/validation/staff-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: UpdateStaffFormValues = {
  fullName: "",
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

export function EditStaffForm({ staffId }: { staffId: number }) {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useStaffById(staffId)
  const updateMutation = useUpdateStaff()

  const [form, setForm] = useState<UpdateStaffFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<UpdateStaffFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
        nationalId: data.nationalId ?? "",
      })
      setErrors({})
      setErrorMessage("")
    }
  }, [data])

  function setField(key: keyof UpdateStaffFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!isValidId(staffId)) {
      setErrorMessage("رقم الموظف غير صالح")
      return
    }

    const validationResult = updateStaffSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(updateStaffZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      await updateMutation.mutateAsync({
        id: staffId,
        data: updateStaffFormValuesToPayload(validationResult.data),
      })

      navigate(`/staff/${staffId}`)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الموظف"
      setErrorMessage(message)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        جاري تحميل بيانات الموظف...
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-right text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        تعذر تحميل بيانات الموظف.
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="edit-staff-fullName" className={labelClass}>
            الاسم الكامل
          </label>
          <input
            id="edit-staff-fullName"
            value={form.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            placeholder="أدخل اسم الموظف"
            className={inputClass}
          />
          <ErrorText message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="edit-staff-email" className={labelClass}>
            البريد الإلكتروني
          </label>
          <input
            id="edit-staff-email"
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            className={inputClass}
          />
          <ErrorText message={errors.email} />
        </div>

        <div>
          <label htmlFor="edit-staff-phoneNumber" className={labelClass}>
            رقم الهاتف
          </label>
          <input
            id="edit-staff-phoneNumber"
            value={form.phoneNumber}
            onChange={(event) => setField("phoneNumber", event.target.value)}
            placeholder="أدخل رقم الهاتف"
            className={inputClass}
          />
          <ErrorText message={errors.phoneNumber} />
        </div>

        <div>
          <label htmlFor="edit-staff-nationalId" className={labelClass}>
            الرقم القومي
          </label>
          <input
            id="edit-staff-nationalId"
            value={form.nationalId}
            onChange={(event) => setField("nationalId", event.target.value)}
            placeholder="أدخل الرقم القومي"
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
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/staff/${staffId}`)}
        >
          إلغاء
        </Button>
      </div>
    </form>
  )
}
