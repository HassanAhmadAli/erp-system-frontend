import { useState } from "react"

import {
  useCreateLoyaltyReward,
  useDeleteLoyaltyReward,
  useLoyaltyPolicy,
  useLoyaltyRewards,
  useUpdateLoyaltyPolicy,
  useUpdateLoyaltyReward,
} from "@/hooks/Loyalty/useLoyaltyRewards"
import { Button } from "@/view/components/ui/button"

export function LoyaltyRewardsPage() {
  const { data: policy, isLoading: policyLoading } = useLoyaltyPolicy()
  const updatePolicy = useUpdateLoyaltyPolicy()
  const { data: rewards = [], isLoading, isError } = useLoyaltyRewards()
  const createReward = useCreateLoyaltyReward()
  const updateReward = useUpdateLoyaltyReward()
  const deleteReward = useDeleteLoyaltyReward()

  const [pointsPerCurrency, setPointsPerCurrency] = useState("")
  const [currencyPerPoint, setCurrencyPerPoint] = useState("")

  const [threshold, setThreshold] = useState("")
  const [description, setDescription] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [isActive, setIsActive] = useState(true)

  async function handlePolicySave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updatePolicy.mutateAsync({
        pointsPerCurrency: Number(
          pointsPerCurrency || policy?.pointsPerCurrency
        ),
        currencyPerPoint: Number(currencyPerPoint || policy?.currencyPerPoint),
      })
    } catch {
      alert("فشل تحديث السياسة")
    }
  }

  async function handleCreateReward(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createReward.mutateAsync({
        pointsThreshold: Number(threshold),
        rewardDescription: description,
        discountValue: Number(discountValue),
        isActive,
      })
      setThreshold("")
      setDescription("")
      setDiscountValue("")
    } catch {
      alert("فشل إنشاء المكافأة")
    }
  }

  return (
    <div className="space-y-8 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">مكافآت الولاء</h1>

      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-semibold">سياسة النقاط</h2>
        {policyLoading ? (
          <p>جاري التحميل...</p>
        ) : (
          <form
            onSubmit={handlePolicySave}
            className="grid gap-3 md:grid-cols-3"
          >
            <input
              type="number"
              placeholder="نقاط لكل عملة"
              className="rounded-xl border p-3 text-right"
              defaultValue={policy?.pointsPerCurrency}
              onChange={(e) => setPointsPerCurrency(e.target.value)}
            />
            <input
              type="number"
              placeholder="عملة لكل نقطة"
              className="rounded-xl border p-3 text-right"
              defaultValue={policy?.currencyPerPoint}
              onChange={(e) => setCurrencyPerPoint(e.target.value)}
            />
            <Button type="submit" disabled={updatePolicy.isPending}>
              حفظ السياسة
            </Button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-semibold">إضافة مكافأة</h2>
        <form
          onSubmit={handleCreateReward}
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
        >
          <input
            type="number"
            placeholder="حد النقاط"
            className="rounded-xl border p-3 text-right"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            required
          />
          <input
            placeholder="الوصف"
            className="rounded-xl border p-3 text-right"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="قيمة الخصم"
            className="rounded-xl border p-3 text-right"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            نشط
          </label>
          <Button type="submit" disabled={createReward.isPending}>
            إضافة
          </Button>
        </form>
      </section>

      {isLoading ? (
        <p>جاري التحميل...</p>
      ) : isError ? (
        <p className="text-red-500">حدث خطأ</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-right">حد النقاط</th>
                <th className="p-3 text-right">الوصف</th>
                <th className="p-3 text-right">الخصم</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">العمليات</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => (
                <tr key={reward.id} className="border-t">
                  <td className="p-3">{reward.pointsThreshold}</td>
                  <td className="p-3">{reward.rewardDescription}</td>
                  <td className="p-3">{reward.discountValue}</td>
                  <td className="p-3">{reward.isActive ? "نشط" : "غير نشط"}</td>
                  <td className="flex gap-2 p-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateReward.mutate({
                          id: reward.id,
                          data: { isActive: !reward.isActive },
                        })
                      }
                    >
                      {reward.isActive ? "تعطيل" : "تفعيل"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteReward.mutate(reward.id)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
              {rewards.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    لا توجد مكافآت
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
