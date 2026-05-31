import { useState } from "react"
import { useCreateSupplier } from "@/hooks/useCreateSupplier"

export function CreateSupplierForm() {
  const mutation = useCreateSupplier()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSuccessMessage("")
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

      setFullName("")
      setPhone("")
      setEmail("")
      setAddress("")

      setSuccessMessage("تم إنشاء المورد بنجاح")
    } catch (error: any) {
      setErrorMessage(error?.message || "حدث خطأ أثناء إنشاء المورد")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border p-6">
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="اسم المورد"
        className="w-full rounded-xl border p-3"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="رقم الهاتف"
        className="w-full rounded-xl border p-3"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="البريد الإلكتروني"
        className="w-full rounded-xl border p-3"
      />

      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="العنوان"
        className="w-full rounded-xl border p-3"
      />

      {successMessage && (
        <div className="rounded-xl bg-green-100 p-3 text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-red-100 p-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-xl bg-green-600 px-5 py-2 text-white disabled:opacity-50"
      >
        {mutation.isPending ? "جاري الحفظ..." : "إضافة المورد"}
      </button>
    </form>
  )
}
