import { useActiveDiscounts } from "@/hooks/use-discounts"

export function ActiveDiscountsPage() {
  const { data, isLoading, error } = useActiveDiscounts()

  if (isLoading) {
    return <div className="p-6">جاري تحميل الخصومات الفعالة...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">فشل تحميل الخصومات الفعالة</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">الخصومات الفعالة</h1>

      <div className="grid gap-4">
        {data?.data.map((discount) => (
          <div key={discount.id} className="rounded-2xl border p-4">
            <h2 className="font-bold">{discount.name}</h2>

            <p>النوع: {discount.type}</p>

            <p>القيمة: {discount.value}</p>

            <p>النطاق: {discount.scope}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
