import { useEffect, useState } from "react"
import { useSupplierById } from "@/hooks/Suppliers/useSupplierById"
import { useUpdateSupplier } from "@/hooks/Suppliers/useUpdateSupplier"

export function EditSupplierForm({
  supplierId,
  onClose,
}: {
  supplierId: number
  onClose: () => void
}) {
  const { data } = useSupplierById(supplierId)
  const updateMutation = useUpdateSupplier()

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
      })
    }
  }, [data])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await updateMutation.mutateAsync({
      id: supplierId,
      data: form,
    })

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        className="w-full border p-2"
        placeholder="الاسم"
      />

      <input
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full border p-2"
        placeholder="الهاتف"
      />

      <input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border p-2"
        placeholder="الإيميل"
      />

      <input
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        className="w-full border p-2"
        placeholder="العنوان"
      />

      <button className="bg-green-600 px-4 py-2 text-white">حفظ التعديل</button>
    </form>
  )
}
