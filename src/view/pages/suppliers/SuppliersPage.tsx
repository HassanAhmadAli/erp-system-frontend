import { CreateSupplierForm } from "@/view/components/suppliers/create-supplier-form"
import { SuppliersTable } from "@/view/components/suppliers/SuppliersTable"
import { useNavigate } from "react-router-dom"

import { useState } from "react"
import { useSuppliers } from "@/hooks/useSuppliers"
import { EditSupplierForm } from "@/view/components/suppliers/EditSupplierForm"
// EditSupplierForm import removed because the module was not found.
// A placeholder is rendered in the modal instead.

export function SuppliersPage() {
  const [editId, setEditId] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الموردين</h1>

      <SuppliersTable onEdit={(id) => setEditId(id)} />

      {editId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-[400px] rounded-xl bg-white p-4">
            <EditSupplierForm
              supplierId={editId}
              onClose={() => setEditId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
