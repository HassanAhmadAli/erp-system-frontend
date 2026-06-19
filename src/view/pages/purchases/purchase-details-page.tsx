// import { useNavigate, useParams } from "react-router-dom"

// import {
//   usePurchaseInvoiceById,
//   useUpdatePurchaseInvoiceStatus,
// } from "@/hooks/Purchases/usePurchases"
// import type { PurchaseInvoiceStatus } from "@/services/purchase-service"
// import { Button } from "@/view/components/ui/button"

// const statuses: PurchaseInvoiceStatus[] = [
//   "PENDING",
//   "COMPLETED",
//   "CANCELLED",
//   "REFUNDED",
// ]

// export function PurchaseDetailsPage() {
//   const { id } = useParams()
//   const invoiceId = Number(id)
//   const navigate = useNavigate()

//   const {
//     data: invoice,
//     isLoading,
//     isError,
//   } = usePurchaseInvoiceById(invoiceId)
//   const updateStatus = useUpdatePurchaseInvoiceStatus()

//   async function handleStatusChange(status: PurchaseInvoiceStatus) {
//     try {
//       await updateStatus.mutateAsync({ id: invoiceId, status })
//     } catch {
//       alert("فشل تحديث الحالة")
//     }
//   }

//   if (isLoading) return <p className="p-6">جاري التحميل...</p>
//   if (isError || !invoice) {
//     return <p className="p-6 text-red-500">الفاتورة غير موجودة</p>
//   }

//   return (
//     <div className="space-y-6 p-6" dir="rtl">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">فاتورة شراء #{invoice.id}</h1>
//         <Button variant="outline" onClick={() => navigate("/purchases")}>
//           رجوع
//         </Button>
//       </div>

//       <div className="space-y-2 rounded-2xl border p-5">
//         <p>
//           <strong>المورد:</strong>{" "}
//           {invoice.supplier?.fullName ?? invoice.supplierId}
//         </p>
//         <p>
//           <strong>الحالة:</strong> {invoice.status}
//         </p>
//         <p>
//           <strong>التاريخ:</strong>{" "}
//           {new Date(invoice.invoiceDate).toLocaleDateString("ar-SY")}
//         </p>
//         {invoice.total != null && (
//           <p>
//             <strong>الإجمالي:</strong> {invoice.total}
//           </p>
//         )}
//       </div>

//       <div className="flex flex-wrap gap-2">
//         {statuses.map((status) => (
//           <Button
//             key={status}
//             variant={invoice.status === status ? "default" : "outline"}
//             disabled={updateStatus.isPending}
//             onClick={() => handleStatusChange(status)}
//           >
//             {status}
//           </Button>
//         ))}
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
//                   <td className="p-3">{item.unitCost}</td>
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
