import { type FormEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useSupplierById } from "@/hooks/Suppliers/useSupplierById"
import { useUpdateSupplier } from "@/hooks/Suppliers/useUpdateSupplier"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

export function EditSupplierForm({ supplierId }: { supplierId: number }) {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useSupplierById(supplierId)
  const updateMutation = useUpdateSupplier()

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  })

  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        address: data.address ?? "",
      })
    }
  }, [data])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!form.fullName.trim()) {
      setErrorMessage("اسم المورد مطلوب")
      return
    }

    if (!form.phone.trim()) {
      setErrorMessage("رقم الهاتف مطلوب")
      return
    }

    if (!form.email.trim()) {
      setErrorMessage("البريد الإلكتروني مطلوب")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: supplierId,
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        },
      })

      navigate(`/suppliers/${supplierId}`)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ أثناء تحديث المورد"
      setErrorMessage(message)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-right text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        جاري تحميل بيانات المورد...
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-right text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        تعذر تحميل بيانات المورد.
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
          <label htmlFor="edit-supplier-fullName" className={labelClass}>
            اسم المورد
          </label>
          <input
            id="edit-supplier-fullName"
            value={form.fullName}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                fullName: event.target.value,
              }))
            }
            placeholder="أدخل اسم المورد"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="edit-supplier-phone" className={labelClass}>
            رقم الهاتف
          </label>
          <input
            id="edit-supplier-phone"
            value={form.phone}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                phone: event.target.value,
              }))
            }
            placeholder="أدخل رقم الهاتف"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="edit-supplier-email" className={labelClass}>
            البريد الإلكتروني
          </label>
          <input
            id="edit-supplier-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                email: event.target.value,
              }))
            }
            placeholder="أدخل البريد الإلكتروني"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="edit-supplier-address" className={labelClass}>
            العنوان
          </label>
          <input
            id="edit-supplier-address"
            value={form.address}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                address: event.target.value,
              }))
            }
            placeholder="أدخل عنوان المورد"
            className={inputClass}
          />
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
          onClick={() => navigate(`/suppliers/${supplierId}`)}
        >
          إلغاء
        </Button>
      </div>
    </form>
  )
}