import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { useCreateSupplier } from "@/hooks/Suppliers/useCreateSupplier"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"

export function CreateSupplierForm() {
  const navigate = useNavigate()
  const mutation = useCreateSupplier()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

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
        fullName,
        phone,
        email,
        address,
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
      className="space-y-5 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
    >
      <div>
        <label
          htmlFor="supplier-fullName"
          className="mb-2 block text-sm font-medium"
        >
          اسم المورد
        </label>
        <input
          id="supplier-fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="أدخل اسم المورد"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="supplier-phone"
          className="mb-2 block text-sm font-medium"
        >
          رقم الهاتف
        </label>
        <input
          id="supplier-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="أدخل رقم الهاتف"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="supplier-email"
          className="mb-2 block text-sm font-medium"
        >
          البريد الإلكتروني
        </label>
        <input
          id="supplier-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="أدخل البريد الإلكتروني"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="supplier-address"
          className="mb-2 block text-sm font-medium"
        >
          العنوان
        </label>
        <input
          id="supplier-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="أدخل عنوان المورد"
          className={inputClass}
        />
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2">
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
