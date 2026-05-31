// import { useSuppliers } from "@/hooks/useSuppliers"

// export function SuppliersTable() {
//   const { data, isLoading } = useSuppliers()

//   if (isLoading) {
//     return <p>جاري تحميل الموردين...</p>
//   }

//   return (
//     <div className="overflow-hidden rounded-2xl border">
//       <table className="w-full">
//         <thead>
//           <tr className="bg-gray-100 text-right">
//             <th className="p-3">الاسم</th>
//             <th className="p-3">الهاتف</th>
//             <th className="p-3">البريد</th>
//             <th className="p-3">العنوان</th>
//             <th className="p-3">المنتجات</th>
//             <th className="p-3">فواتير الشراء</th>
//           </tr>
//         </thead>

//         <tbody>
//           {data?.data.map((supplier) => (
//             <tr
//               key={supplier.id}
//               className="border-t"
//             >
//               <td className="p-3">{supplier.fullName}</td>
//               <td className="p-3">{supplier.phone}</td>
//               <td className="p-3">{supplier.email}</td>
//               <td className="p-3">{supplier.address}</td>

//               <td className="p-3">
//                 {supplier._count?.products ?? 0}
//               </td>

//               <td className="p-3">
//                 {supplier._count?.purchaseInvoices ?? 0}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

import { useSuppliers } from "@/hooks/useSuppliers"
import { useDeleteSupplier } from "@/hooks/useDeleteSupplier"

export function SuppliersTable({ onEdit }: { onEdit: (id: number) => void }) {
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

              <td className="flex gap-2 p-3">
                <button
                  onClick={() => onEdit(s.id)}
                  className="rounded bg-blue-500 px-3 py-1 text-white"
                >
                  تعديل
                </button>

                <button
                  onClick={() => deleteMutation.mutate(s.id)}
                  className="rounded bg-red-500 px-3 py-1 text-white"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
