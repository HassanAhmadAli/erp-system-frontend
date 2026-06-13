import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useSupplierById } from "@/hooks/Suppliers/useSupplierById"
import { useUpdateSupplier } from "@/hooks/Suppliers/useUpdateSupplier"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"

export function EditSupplierForm({ supplierId }: { supplierId: number }) {
  const navigate = useNavigate()
  const { data, isLoading } = useSupplierById(supplierId)
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
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        address: data.address,
      })
    }
  }, [data])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        data: form,
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
      <p className="text-[var(--erp-muted)]">جاري تحميل بيانات المورد...</p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
    >
      <div>
        <label
          htmlFor="edit-supplier-fullName"
          className="mb-2 block text-sm font-medium"
        >
          اسم المورد
        </label>
        <input
          id="edit-supplier-fullName"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="أدخل اسم المورد"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="edit-supplier-phone"
          className="mb-2 block text-sm font-medium"
        >
          رقم الهاتف
        </label>
        <input
          id="edit-supplier-phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="أدخل رقم الهاتف"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="edit-supplier-email"
          className="mb-2 block text-sm font-medium"
        >
          البريد الإلكتروني
        </label>
        <input
          id="edit-supplier-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="أدخل البريد الإلكتروني"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="edit-supplier-address"
          className="mb-2 block text-sm font-medium"
        >
          العنوان
        </label>
        <input
          id="edit-supplier-address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
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
