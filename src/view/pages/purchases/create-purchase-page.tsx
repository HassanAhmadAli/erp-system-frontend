// import { useState } from "react"
// import { useNavigate } from "react-router-dom"

// import { useCreatePurchaseInvoice } from "@/hooks/Purchases/usePurchases"
// import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
// import { Button } from "@/view/components/ui/button"

// type ItemRow = {
//   productId: string
//   quantity: string
//   unitCost: string
//   expiryDate: string
// }

// const emptyItem = (): ItemRow => ({
//   productId: "",
//   quantity: "1",
//   unitCost: "",
//   expiryDate: "",
// })

// export function CreatePurchasePage() {
//   const navigate = useNavigate()
//   const createMutation = useCreatePurchaseInvoice()
//   const { data: suppliersData } = useSuppliers()
//   const suppliers = suppliersData?.data ?? []

//   const [supplierId, setSupplierId] = useState("")
//   const [invoiceDate, setInvoiceDate] = useState(
//     new Date().toISOString().slice(0, 10)
//   )
//   const [receive, setReceive] = useState(false)
//   const [items, setItems] = useState<ItemRow[]>([emptyItem()])

//   function updateItem(index: number, field: keyof ItemRow, value: string) {
//     setItems((prev) =>
//       prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
//     )
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()

//     try {
//       await createMutation.mutateAsync({
//         supplierId: Number(supplierId),
//         invoiceDate,
//         receive,
//         items: items.map((item) => ({
//           productId: Number(item.productId),
//           quantity: Number(item.quantity),
//           unitCost: Number(item.unitCost),
//           expiryDate: item.expiryDate || undefined,
//         })),
//       })
//       navigate("/purchases")
//     } catch {
//       alert("فشل إنشاء فاتورة الشراء")
//     }
//   }

//   return (
//     <div className="mx-auto max-w-2xl space-y-6 p-6" dir="rtl">
//       <h1 className="text-2xl font-bold">إنشاء فاتورة شراء</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <select
//           className="w-full rounded-xl border p-3"
//           value={supplierId}
//           onChange={(e) => setSupplierId(e.target.value)}
//           required
//         >
//           <option value="">اختر المورد</option>
//           {suppliers.map((s) => (
//             <option key={s.id} value={s.id}>
//               {s.fullName}
//             </option>
//           ))}
//         </select>

//         <input
//           type="date"
//           className="w-full rounded-xl border p-3"
//           value={invoiceDate}
//           onChange={(e) => setInvoiceDate(e.target.value)}
//           required
//         />

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             checked={receive}
//             onChange={(e) => setReceive(e.target.checked)}
//           />
//           استلام البضاعة فوراً
//         </label>

//         <div className="space-y-3">
//           <h2 className="font-semibold">البنود</h2>
//           {items.map((item, index) => (
//             <div
//               key={index}
//               className="grid gap-2 rounded-xl border p-3 md:grid-cols-4"
//             >
//               <input
//                 placeholder="معرف المنتج"
//                 className="rounded-lg border p-2 text-right"
//                 value={item.productId}
//                 onChange={(e) => updateItem(index, "productId", e.target.value)}
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="الكمية"
//                 className="rounded-lg border p-2 text-right"
//                 value={item.quantity}
//                 onChange={(e) => updateItem(index, "quantity", e.target.value)}
//                 required
//               />
//               <input
//                 type="number"
//                 step="0.01"
//                 placeholder="سعر الوحدة"
//                 className="rounded-lg border p-2 text-right"
//                 value={item.unitCost}
//                 onChange={(e) => updateItem(index, "unitCost", e.target.value)}
//                 required
//               />
//               <input
//                 type="date"
//                 className="rounded-lg border p-2"
//                 value={item.expiryDate}
//                 onChange={(e) =>
//                   updateItem(index, "expiryDate", e.target.value)
//                 }
//               />
//             </div>
//           ))}
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => setItems((prev) => [...prev, emptyItem()])}
//           >
//             إضافة بند
//           </Button>
//         </div>

//         <div className="flex gap-2">
//           <Button type="submit" disabled={createMutation.isPending}>
//             حفظ
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => navigate("/purchases")}
//           >
//             إلغاء
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }
