import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { normalizeImportJobs } from "@/services/product-service"
import {
  useImportProductsMutation,
  useProductImportJob,
  useProductImportJobs,
} from "@/hooks/Products/useProductImport"

export function ProductImportPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string>("")
  const [selectedJobId, setSelectedJobId] = useState<number | string | null>(
    null
  )

  const importMutation = useImportProductsMutation()
  const importJobsQuery = useProductImportJobs()
  const jobDetailsQuery = useProductImportJob(selectedJobId)

  const jobs = normalizeImportJobs(importJobsQuery.data)

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">استيراد المنتجات</h1>
          <p className="mt-1 text-[var(--erp-muted)]">
            استيراد المنتجات من ملف CSV
          </p>
        </div>

        <button
          onClick={() => navigate("/products")}
          className="rounded-xl bg-gray-600 px-4 py-2 text-white"
        >
          العودة للمنتجات
        </button>
      </div>

      <section className="rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">استيراد منتجات CSV</h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              ارفع ملف CSV ثم راقب حالة مهام الاستيراد
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <label className="block text-sm text-[var(--erp-muted)]">
              ملف CSV
            </label>

            <label
              htmlFor="csv-upload"
              className={`relative block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-right transition hover:border-gray-400 hover:bg-gray-50 ${
                importMutation.isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <span className="block text-sm text-[var(--erp-muted)]">
                انقر لاختيار ملف CSV أو اسحبه هنا
              </span>
              <span className="mt-2 block text-sm font-semibold text-gray-700">
                {selectedFile?.name ?? "لم يتم اختيار أي ملف"}
              </span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                disabled={importMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setSelectedFile(file)
                  setMessage("")
                }}
              />
            </label>

            <button
              type="button"
              disabled={importMutation.isPending}
              onClick={() => {
                if (!selectedFile) {
                  setMessage("يرجى اختيار ملف CSV")
                  return
                }
                void (async () => {
                  try {
                    setMessage("")
                    await importMutation.mutateAsync(selectedFile)
                    setSelectedFile(null)
                    setMessage("تم بدء عملية الاستيراد")
                  } catch (err: unknown) {
                    setMessage(err instanceof Error ? err.message : "فشل بدء الاستيراد")
                  }
                })()
              }}
              className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {importMutation.isPending ? "جاري البدء..." : "بدء الاستيراد"}
            </button>

            {message && (
              <div className="rounded-xl bg-gray-100 p-3 text-sm">
                {message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">مهام الاستيراد</div>
            {importJobsQuery.isLoading && (
              <p className="text-sm text-[var(--erp-muted)]">
                جاري تحميل المهام...
              </p>
            )}

            {importJobsQuery.error && (
              <p className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
                فشل تحميل مهام الاستيراد
              </p>
            )}

            {!importJobsQuery.isLoading &&
              !importJobsQuery.error &&
              (jobs.length ? (
                <div className="max-h-52 space-y-2 overflow-auto">
                  {jobs.map((job) => (
                    <button
                      key={String(job.id)}
                      type="button"
                      onClick={() => setSelectedJobId(job.id)}
                      className="w-full rounded-xl border bg-white p-3 text-right hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">#{job.id}</span>
                        <span className="text-sm text-[var(--erp-muted)]">
                          {job.status ?? "unknown"}
                        </span>
                      </div>
                      {job.createdAt && (
                        <div className="mt-1 text-xs text-[var(--erp-muted)]">
                          {job.createdAt}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--erp-muted)]">
                  لا توجد مهام حالياً
                </p>
              ))}
          </div>
        </div>

        {selectedJobId !== null && (
          <div className="mt-6 rounded-2xl bg-[var(--erp-page)] p-4 text-left">
            <div className="mb-2 text-right font-semibold">تفاصيل المهمة</div>
            {jobDetailsQuery.isLoading ? (
              <p className="text-right text-sm text-[var(--erp-muted)]">
                جاري تحميل التفاصيل...
              </p>
            ) : jobDetailsQuery.error ? (
              <p className="text-right text-sm text-red-700">
                فشل تحميل تفاصيل المهمة
              </p>
            ) : (
              <pre className="max-h-56 overflow-auto text-xs">
                {JSON.stringify(jobDetailsQuery.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
