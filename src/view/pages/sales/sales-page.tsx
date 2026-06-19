// import { Link } from "react-router-dom"

// import { useSalesInvoices } from "@/hooks/Sales/useSales"
// import { Button } from "@/view/components/ui/button"

// export function SalesPage() {
//   const { data: invoices = [], isLoading, isError } = useSalesInvoices()

//   return (
//     <div className="space-y-6 p-6" dir="rtl">
//       <h1 className="text-2xl font-bold">فواتير المبيعات</h1>

//       {isLoading ? (
//         <p>جاري التحميل...</p>
//       ) : isError ? (
//         <p className="text-red-500">حدث خطأ أثناء تحميل الفواتير</p>
//       ) : (
//         <div className="overflow-hidden rounded-2xl border">
//           <table className="w-full">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3 text-right">#</th>
//                 <th className="p-3 text-right">الحالة</th>
//                 <th className="p-3 text-right">العميل</th>
//                 <th className="p-3 text-right">الإجمالي</th>
//                 <th className="p-3 text-right">التاريخ</th>
//                 <th className="p-3 text-right">العمليات</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices.map((invoice) => (
//                 <tr key={invoice.id} className="border-t">
//                   <td className="p-3">{invoice.id}</td>
//                   <td className="p-3">{invoice.status}</td>
//                   <td className="p-3">
//                     {invoice.customer?.user?.fullName ?? "زبون نقدي"}
//                   </td>
//                   <td className="p-3">{invoice.total ?? "—"}</td>
//                   <td className="p-3">
//                     {invoice.createdAt
//                       ? new Date(invoice.createdAt).toLocaleDateString("ar-SY")
//                       : "—"}
//                   </td>
//                   <td className="p-3">
//                     <Link to={`/sales/${invoice.id}`}>
//                       <Button variant="outline">عرض</Button>
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//               {invoices.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="p-6 text-center">
//                     لا توجد فواتير
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }
