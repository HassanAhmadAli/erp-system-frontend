// type Props = {
//   register: any
//   errors: any
// }

// export function DiscountForm({ register, errors }: Props) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//       {/* NAME */}
//       <div className="md:col-span-2">
//         <label className="text-sm font-medium">اسم الخصم</label>
//         <input
//           {...register("name")}
//           className="h-11 w-full rounded-xl border px-3 text-right"
//         />
//         <p className="text-red-500 text-xs mt-1">
//           {errors?.name?.message}
//         </p>
//       </div>

//       {/* TYPE */}
//       <div>
//         <label className="text-sm font-medium">نوع الخصم</label>
//         <select
//           {...register("type")}
//           className="h-11 w-full rounded-xl border px-3"
//         >
//           <option value="PERCENTAGE">نسبة %</option>
//           <option value="FIXED_AMOUNT">مبلغ ثابت</option>
//         </select>
//       </div>

//       {/* SCOPE */}
//       <div>
//         <label className="text-sm font-medium">نطاق الخصم</label>
//         <select
//           {...register("scope")}
//           className="h-11 w-full rounded-xl border px-3"
//         >
//           <option value="GLOBAL">عام</option>
//           <option value="CATEGORY">تصنيف</option>
//           <option value="PRODUCT">منتج</option>
//           <option value="CUSTOMER">عميل</option>
//         </select>
//       </div>

//       {/* VALUE */}
//       <div>
//         <label className="text-sm font-medium">القيمة</label>
//         <input
//           type="number"
//           {...register("value")}
//           className="h-11 w-full rounded-xl border px-3"
//         />
//       </div>

//       {/* START DATE */}
//       <div>
//         <label className="text-sm font-medium">تاريخ البداية</label>
//         <input
//           type="date"
//           {...register("startDate")}
//           className="h-11 w-full rounded-xl border px-3"
//         />
//       </div>

//       {/* END DATE */}
//       <div>
//         <label className="text-sm font-medium">تاريخ النهاية</label>
//         <input
//           type="date"
//           {...register("endDate")}
//           className="h-11 w-full rounded-xl border px-3"
//         />
//       </div>

//     </div>
//   )
// }

//_____________________________________________________________________________//

import { normalizeProducts } from "@/services/product-service"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useProducts } from "@/hooks/Products/useProducts"

type Props = {
  register: any
  errors: any
  watch?: any
}

export function DiscountForm({ register, errors, watch }: Props) {
  const scope = watch ? watch("scope") : undefined

  const { data: categoriesData } = useCategoriesForSelect()
  const { data: productsData } = useProducts()

  const categories = categoriesData?.data ?? []
  const products = normalizeProducts(productsData)

  return (
    <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2">
      {/* NAME */}
      <div className="space-y-1.5 md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700">
          اسم الخصم
        </label>
        <input
          {...register("name")}
          placeholder="أدخل اسم الخصم"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
        {errors?.name?.message && (
          <p className="text-sm font-medium text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* TYPE */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          نوع الخصم
        </label>
        <div className="relative">
          <select
            {...register("type")}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          >
            <option value="PERCENTAGE">نسبة مئوية (%)</option>
            <option value="FIXED_AMOUNT">مبلغ ثابت</option>
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* SCOPE */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          النطاق
        </label>
        <div className="relative">
          <select
            {...register("scope")}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          >
            <option value="GLOBAL">عام (كل المتجر)</option>
            <option value="CATEGORY">تصنيف محدد</option>
            <option value="PRODUCT">منتج محدد</option>
            <option value="CUSTOMER">عميل محدد</option>
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* CATEGORY TARGET (scope = CATEGORY) */}
      {scope === "CATEGORY" && (
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            التصنيف المستهدف
          </label>
          <select
            {...register("categoryId")}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          >
            <option value="">اختر التصنيف</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors?.categoryId?.message && (
            <p className="text-sm font-medium text-red-500">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      )}

      {/* PRODUCT TARGET (scope = PRODUCT) */}
      {scope === "PRODUCT" && (
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            المنتج المستهدف
          </label>
          <select
            {...register("productId")}
            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          >
            <option value="">اختر المنتج</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors?.productId?.message && (
            <p className="text-sm font-medium text-red-500">
              {errors.productId.message}
            </p>
          )}
        </div>
      )}

      {/* VALUE */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          قيمة الخصم
        </label>
        <div className="relative">
          <input
            type="number"
            {...register("value")}
            placeholder="0"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
            ر.س
          </span>
        </div>
      </div>

      {/* MAX USES */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          عدد الاستخدامات المسموح
        </label>
        <input
          type="number"
          {...register("maxUses")}
          placeholder="غير محدود"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
        />
      </div>

      {/* MAX INVOICE */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          أقصى قيمة للفاتورة
        </label>
        <div className="relative">
          <input
            type="number"
            {...register("maxInvoiceValue")}
            placeholder="بدون حد أقصى"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
            ر.س
          </span>
        </div>
      </div>

      {/* DATES ROW */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:col-span-2">
        {/* START DATE */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            تاريخ البداية
          </label>
          <input
            type="date"
            {...register("startDate")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 [direction:ltr] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>

        {/* END DATE */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            تاريخ النهاية
          </label>
          <input
            type="date"
            {...register("endDate")}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 transition-all duration-200 [direction:ltr] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>
      </div>

      {/* ACTIVE */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 md:col-span-2">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            {...register("isActive")}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-emerald-300 bg-white transition-all duration-200 checked:border-emerald-500 checked:bg-emerald-500"
          />
          <svg
            className="pointer-events-none absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <label className="cursor-pointer text-sm font-semibold text-emerald-800 select-none">
          تفعيل الخصم
        </label>
        <span className="mr-auto text-xs text-emerald-600/70">
          الخصم سيكون متاحاً للاستخدام فور الحفظ
        </span>
      </div>
    </div>
  )
}
