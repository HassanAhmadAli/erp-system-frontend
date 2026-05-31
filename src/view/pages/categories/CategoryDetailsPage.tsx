import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getCategoryById } from "@/services/category-service"

export function CategoryDetailsPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) return <p className="text-center">جاري التحميل...</p>

  if (!data) return <p>لا يوجد بيانات</p>

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-right">
        <h2 className="text-3xl font-bold">{data.name}</h2>
        <p className="text-gray-500">{data.description}</p>

        <p className="mt-2 text-sm text-gray-400">
          عدد المنتجات: {data._count.products}
        </p>
      </div>

      {/* PRODUCTS */}
      <div className="space-y-3">
        <h3 className="text-right text-xl font-bold">المنتجات</h3>

        {data.products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border p-3"
          >
            <div className="text-right">
              <p className="font-bold">{p.name}</p>
              <p className="text-sm text-gray-500">{p.barcode}</p>
            </div>

            <div className="text-left text-sm">
              <p>السعر: {p.sellingPrice}</p>
              <p>الكمية: {p.quantityInStock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
