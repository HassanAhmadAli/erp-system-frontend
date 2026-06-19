// import { useNavigate, useParams } from "react-router-dom"

// import { useSalesInvoiceById } from "@/hooks/Sales/useSales"
// import { Button } from "@/view/components/ui/button"

// export function SalesDetailsPage() {
//   const { id } = useParams()
//   const invoiceId = Number(id)
//   const navigate = useNavigate()

//   const { data: invoice, isLoading, isError } = useSalesInvoiceById(invoiceId)

//   if (isLoading) return <p className="p-6">جاري التحميل...</p>
//   if (isError || !invoice) {
//     return <p className="p-6 text-red-500">الفاتورة غير موجودة</p>
//   }

//   return (
//     <div className="space-y-6 p-6" dir="rtl">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">فاتورة مبيعات #{invoice.id}</h1>
//         <Button variant="outline" onClick={() => navigate("/sales")}>
//           رجوع
//         </Button>
//       </div>

//       <div className="grid gap-2 rounded-2xl border p-5 md:grid-cols-2">
//         <p>
//           <strong>الحالة:</strong> {invoice.status}
//         </p>
//         <p>
//           <strong>العميل:</strong>{" "}
//           {invoice.customer?.user?.fullName ?? "زبون نقدي"}
//         </p>
//         <p>
//           <strong>المجموع الفرعي:</strong> {invoice.subtotal ?? "—"}
//         </p>
//         <p>
//           <strong>الخصم:</strong> {invoice.discountAmount ?? "0"}
//         </p>
//         <p>
//           <strong>الإجمالي:</strong> {invoice.total ?? "—"}
//         </p>
//         <p>
//           <strong>المدفوع:</strong> {invoice.amountPaid ?? "—"}
//         </p>
//         {invoice.createdAt && (
//           <p>
//             <strong>التاريخ:</strong>{" "}
//             {new Date(invoice.createdAt).toLocaleDateString("ar-SY")}
//           </p>
//         )}
//       </div>

//       {invoice.items && invoice.items.length > 0 && (
//         <div className="overflow-hidden rounded-2xl border">
//           <table className="w-full">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-3 text-right">المنتج</th>
//                 <th className="p-3 text-right">الكمية</th>
//                 <th className="p-3 text-right">سعر الوحدة</th>
//                 <th className="p-3 text-right">الإجمالي</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoice.items.map((item, i) => (
//                 <tr key={i} className="border-t">
//                   <td className="p-3">
//                     {item.product?.name ?? item.productId}
//                   </td>
//                   <td className="p-3">{item.quantity}</td>
//                   <td className="p-3">{item.unitPrice}</td>
//                   <td className="p-3">{item.subtotal ?? "—"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }
