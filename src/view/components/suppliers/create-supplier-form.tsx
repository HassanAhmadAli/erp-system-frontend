import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateSupplier } from "@/hooks/Suppliers/useCreateSupplier"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

export function CreateSupplierForm() {
  const navigate = useNavigate()
  const mutation = useCreateSupplier()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!fullName.trim()) {
      setErrorMessage("اسم المورد مطلوب")
      return
    }

    if (!phone.trim()) {
      setErrorMessage("رقم الهاتف مطلوب")
      return
    }

    if (!email.trim()) {
      setErrorMessage("البريد الإلكتروني مطلوب")
      return
    }

    try {
      await mutation.mutateAsync({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      })

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
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="أدخل اسم المورد"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="supplier-phone" className={labelClass}>
            رقم الهاتف
          </label>
          <input
            id="supplier-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="أدخل رقم الهاتف"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="supplier-email" className={labelClass}>
            البريد الإلكتروني
          </label>
          <input
            id="supplier-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="supplier-address" className={labelClass}>
            العنوان
          </label>
          <input
            id="supplier-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
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