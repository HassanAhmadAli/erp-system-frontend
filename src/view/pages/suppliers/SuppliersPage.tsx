import { Link } from "react-router-dom"

import { SuppliersTable } from "@/view/components/suppliers/SuppliersTable"
import { Button } from "@/view/components/ui/button"

export function SuppliersPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الموردين</h1>
        <Link to="/suppliers/create">
          <Button>إضافة مورد</Button>
        </Link>
      </div>

      <SuppliersTable />
    </div>
  )
}
