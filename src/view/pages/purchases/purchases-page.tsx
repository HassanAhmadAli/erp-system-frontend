// import { Link } from "react-router-dom"

// import { usePurchaseInvoices } from "@/hooks/Purchases/usePurchases"
// import { Button } from "@/view/components/ui/button"

// export function PurchasesPage() {
//   const { data: invoices = [], isLoading, isError } = usePurchaseInvoices()

//   return (
//     <div className="space-y-6 p-6" dir="rtl">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">فواتير الشراء</h1>
//         <Link to="/purchases/create">
//           <Button>إنشاء فاتورة شراء</Button>
//         </Link>
//       </div>

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
//                 <th className="p-3 text-right">المورد</th>
//                 <th className="p-3 text-right">الحالة</th>
//                 <th className="p-3 text-right">الإجمالي</th>
//                 <th className="p-3 text-right">التاريخ</th>
//                 <th className="p-3 text-right">العمليات</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices.map((invoice) => (
//                 <tr key={invoice.id} className="border-t">
//                   <td className="p-3">{invoice.id}</td>
//                   <td className="p-3">
//                     {invoice.supplier?.fullName ?? invoice.supplierId}
//                   </td>
//                   <td className="p-3">{invoice.status}</td>
//                   <td className="p-3">{invoice.total ?? "—"}</td>
//                   <td className="p-3">
//                     {invoice.invoiceDate
//                       ? new Date(invoice.invoiceDate).toLocaleDateString(
//                           "ar-SY"
//                         )
//                       : "—"}
//                   </td>
//                   <td className="p-3">
//                     <Link to={`/purchases/${invoice.id}`}>
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
