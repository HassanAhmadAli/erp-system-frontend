import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateSupplier } from "@/hooks/Suppliers/useCreateSupplier"
import {
  supplierFormValuesToPayload,
  supplierSchema,
  supplierZodErrorToFormErrors,
  type SupplierFormErrors,
  type SupplierFormValues,
} from "@/validation/supplier-schema"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

const EMPTY_FORM: SupplierFormValues = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1 text-xs text-red-500 dark:text-red-300">{message}</p>
  )
}

export function CreateSupplierForm() {
  const navigate = useNavigate()
  const mutation = useCreateSupplier()

  const [form, setForm] = useState<SupplierFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<SupplierFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")

  function setField(key: keyof SupplierFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    const validationResult = supplierSchema.safeParse(form)

    if (!validationResult.success) {
      setErrors(supplierZodErrorToFormErrors(validationResult.error))
      return
    }

    setErrors({})

    try {
      await mutation.mutateAsync(
        supplierFormValuesToPayload(validationResult.data)
      )

      navigate("/suppliers")
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء المورد"
      setErrorMessage(message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-text)] shadow-[var(--erp-shadow)]"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="supplier-fullName" className={labelClass}>
            اسم المورد
          </label>
          <input
            id="supplier-fullName"
            value={form.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            placeholder="أدخل اسم المورد"
            className={inputClass}
          />
          <ErrorText message={errors.fullName} />
        </div>

        <div>
          <label htmlFor="supplier-phone" className={labelClass}>
            رقم الهاتف
          </label>
          <input
            id="supplier-phone"
            value={form.phone}
            onChange={(event) => setField("phone", event.target.value)}
            placeholder="أدخل رقم الهاتف"
            className={inputClass}
          />
          <ErrorText message={errors.phone} />
        </div>

        <div>
          <label htmlFor="supplier-email" className={labelClass}>
            البريد الإلكتروني
          </label>
          <input
            id="supplier-email"
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            className={inputClass}
          />
          <ErrorText message={errors.email} />
        </div>

        <div>
          <label htmlFor="supplier-address" className={labelClass}>
            العنوان
          </label>
          <input
            id="supplier-address"
            value={form.address}
            onChange={(event) => setField("address", event.target.value)}
            placeholder="أدخل عنوان المورد"
            className={inputClass}
          />
          <ErrorText message={errors.address} />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "جاري الحفظ..." : "إضافة المورد"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/suppliers")}
        >
          إلغاء
        </Button>
      </div>
    </form>
  )
}
