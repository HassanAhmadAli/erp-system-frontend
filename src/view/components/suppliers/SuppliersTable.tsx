import { Link } from "react-router-dom"

import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { useDeleteSupplier } from "@/hooks/Suppliers/useDeleteSupplier"
import { Button } from "@/view/components/ui/button"

export function SuppliersTable() {
  const { data, isLoading, error } = useSuppliers()
  const deleteMutation = useDeleteSupplier()

  if (isLoading) return <p>جاري التحميل...</p>

  if (error) return <p>حدث خطأ في تحميل الموردين</p>

  return (
    <div className="overflow-hidden rounded-2xl border">
      <table className="w-full text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">الاسم</th>
            <th className="p-3">الهاتف</th>
            <th className="p-3">الإيميل</th>
            <th className="p-3">العنوان</th>
            <th className="p-3">إجراءات</th>
          </tr>
        </thead>

        <tbody>
          {data?.data.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-3">{s.fullName}</td>
              <td className="p-3">{s.phone}</td>
              <td className="p-3">{s.email}</td>
              <td className="p-3">{s.address}</td>

              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Link to={`/suppliers/${s.id}`}>
                    <Button variant="outline" size="sm">
                      عرض المعلومات
                    </Button>
                  </Link>

                  <Link to={`/suppliers/${s.id}/edit`}>
                    <Button variant="outline" size="sm">
                      تعديل
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(s.id)}
                    disabled={deleteMutation.isPending}
                  >
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
