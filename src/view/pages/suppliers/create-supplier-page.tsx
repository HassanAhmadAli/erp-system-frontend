import { CreateSupplierForm } from "@/view/components/suppliers/create-supplier-form"

export function CreateSupplierPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إضافة مورد جديد</h1>

      <CreateSupplierForm />
    </div>
  )
}
