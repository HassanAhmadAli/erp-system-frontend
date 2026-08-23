import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { normalizeImportJobs } from "@/services/product-service"
import {
  useImportProductsMutation,
  useProductImportJob,
  useProductImportJobs,
} from "@/hooks/Products/useProductImport"

export function ProductImportPage() {
  const { t } = useTranslation(["common", "pages"])
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
    <div className="space-y-6 text-start">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {t("pages:products.importTitle")}
          </h1>
          <p className="mt-1 text-[var(--erp-muted)]">
            {t("pages:products.importSubtitle")}
          </p>
        </div>

        <button
          onClick={() => navigate("/products")}
          className="rounded-xl bg-gray-600 px-4 py-2 text-white"
        >
          {t("pages:products.backToProducts")}
        </button>
      </div>

      <section className="rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">
              {t("pages:products.importCsvTitle")}
            </h2>
            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("pages:products.importCsvSubtitle")}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <label className="block text-sm text-[var(--erp-muted)]">
              {t("pages:products.csvFile")}
            </label>

            <label
              htmlFor="csv-upload"
              className={`relative block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-start transition hover:border-gray-400 hover:bg-gray-50 ${
                importMutation.isPending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <span className="block text-sm text-[var(--erp-muted)]">
                {t("pages:products.clickOrDragCsv")}
              </span>
              <span className="mt-2 block text-sm font-semibold text-gray-700">
                {selectedFile?.name ?? t("common:noFileSelected")}
              </span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
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
                  setMessage(t("pages:products.selectCsvFirst"))
                  return
                }
                void (async () => {
                  try {
                    setMessage("")
                    await importMutation.mutateAsync(selectedFile)
                    setSelectedFile(null)
                    setMessage(t("pages:products.importStarted"))
                  } catch (err: unknown) {
                    setMessage(
                      err instanceof Error
                        ? err.message
                        : t("pages:products.startImportFailed")
                    )
                  }
                })()
              }}
              className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {importMutation.isPending
                ? t("common:starting")
                : t("pages:products.startImport")}
            </button>

            {message && (
              <div className="rounded-xl bg-gray-100 p-3 text-sm">
                {message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">
              {t("pages:products.importJobs")}
            </div>
            {importJobsQuery.isLoading && (
              <p className="text-sm text-[var(--erp-muted)]">
                {t("pages:products.loadingJobs")}
              </p>
            )}

            {importJobsQuery.error && (
              <p className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
                {t("pages:products.loadJobsFailed")}
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
                      className="w-full rounded-xl border bg-white p-3 text-start hover:bg-gray-50"
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
                  {t("pages:products.noJobs")}
                </p>
              ))}
          </div>
        </div>

        {selectedJobId !== null && (
          <div className="mt-6 rounded-2xl bg-[var(--erp-page)] p-4 text-left">
            <div className="mb-2 text-start font-semibold">
              {t("pages:products.jobDetails")}
            </div>
            {jobDetailsQuery.isLoading ? (
              <p className="text-start text-sm text-[var(--erp-muted)]">
                {t("common:loadingDetails")}
              </p>
            ) : jobDetailsQuery.error ? (
              <p className="text-start text-sm text-red-700">
                {t("pages:products.loadJobDetailsFailed")}
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
