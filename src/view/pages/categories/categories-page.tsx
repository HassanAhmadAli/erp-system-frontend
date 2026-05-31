import { useEffect, useState } from "react"
import {
  getCategories,
  deleteCategory,
  type Category,
} from "@/services/category-service"

// export function CategoriesPage() {
//   const [categories, setCategories] = useState<Category[]>([])
//   const [loading, setLoading] = useState(true)

//   async function loadData() {
//     try {
//       setLoading(true)
//       const res = await getCategories()
//       setCategories(res.data)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadData()
//   }, [])

//   async function handleDelete(id: number) {
//     await deleteCategory(id)
//     setCategories((prev) => prev.filter((c) => c.id !== id))
//   }

//   if (loading) {
//     return <div className="text-right">جاري التحميل...</div>
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold text-right">التصنيفات</h2>

//       <div className="space-y-3">
//         {categories.map((cat) => (
//           <div
//             key={cat.id}
//             className="flex items-center justify-between rounded-2xl bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)]"
//           >
//             <div className="text-right">
//               <p className="font-bold">{cat.name}</p>
//               <p className="text-sm text-[var(--erp-muted)]">
//                 {cat.description}
//               </p>
//               <p className="text-xs text-[var(--erp-muted)]">
//                 منتجات: {cat._count?.products ?? 0}
//               </p>
//             </div>

//             <button
//               onClick={() => handleDelete(cat.id)}
//               className="rounded-xl bg-red-500 px-4 py-2 text-white"
//             >
//               حذف
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

import { CategoriesTable } from "@/view/components/categories/CategoriesTable"

export function CategoriesPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-right text-2xl font-bold">التصنيفات</h2>
      <CategoriesTable />
    </div>
  )
}
