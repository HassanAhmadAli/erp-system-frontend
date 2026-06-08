import { useParams } from "react-router-dom"

import { useDiscountById } from "@/hooks/use-discounts"
import { ToggleDiscountButton } from "../../components/toggle-discount-button"
import { DeleteDiscountButton } from "../../components/delete-discount-button"
export function DiscountDetailsPage() {
  const params = useParams()

  const id = Number(params.id)

  const { data, isLoading, error } = useDiscountById(id)

  if (isLoading) {
    return <div className="p-6">جاري تحميل الخصم...</div>
  }

  if (error || !data) {
    return <div className="p-6 text-red-500">فشل تحميل الخصم</div>
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-3xl font-bold">{data.name}</h1>

      <div className="rounded-2xl border p-4">
        <p>النوع: {data.type}</p>

        <p>النطاق: {data.scope}</p>

        <p>القيمة: {data.value}</p>

        <p>
          الحالة:
          {data.isActive ? " مفعل" : " معطل"}
        </p>

        <p>
          عدد الاستخدام:
          {data.usedCount}
        </p>

        <p>
          الحد الأقصى للاستخدام:
          {data.maxUses ?? "غير محدود"}
        </p>

        <p>
          تاريخ البداية:
          {new Date(data.startDate).toLocaleDateString()}
        </p>

        <p>
          تاريخ النهاية:
          {data.endDate
            ? new Date(data.endDate).toLocaleDateString()
            : "لا يوجد"}
        </p>

        <ToggleDiscountButton id={data.id} isActive={data.isActive} />

        <DeleteDiscountButton id={data.id} />
      </div>
    </div>
  )
}
