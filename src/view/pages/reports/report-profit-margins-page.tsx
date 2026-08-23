import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useProfitMargins } from "@/hooks/Financial/useFinancial"
import { DEFAULT_PAGE_SIZE, pageToOffset } from "@/lib/pagination"
import { extractPaginationMeta, extractTableRows } from "@/lib/report-parsers"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportTable } from "@/view/components/reports/report-table"

export function ReportProfitMarginsPage() {
  const { t } = useTranslation(["common", "pages"])
  const [page, setPage] = useState(1)
  const params = useMemo(
    () => ({
      limit: DEFAULT_PAGE_SIZE,
      offset: pageToOffset(page, DEFAULT_PAGE_SIZE),
    }),
    [page]
  )
  const { data, isLoading, isError, isFetching } = useProfitMargins(params)

  const rows = extractTableRows(data)
  const { total, isFinalPage } = extractPaginationMeta(data)

  return (
    <ReportLayout
      title={t("reports.profitMargins", { ns: "pages" })}
      description={t("reports.profitMarginsReportDesc", { ns: "pages" })}
      backTo="/reports"
      backLabel={t("reports.allReports", { ns: "pages" })}
      loading={isLoading && !data}
      error={isError}
      actions={
        <ExportReportButton type="profit-margins" label={t("exportCsv")} />
      }
    >
      <ReportTable
        title={t("reports.productDetails", { ns: "pages" })}
        rows={rows}
        pagination={{
          page,
          isFinalPage: isFinalPage ?? rows.length < DEFAULT_PAGE_SIZE,
          isLoading: isFetching,
          total,
          onPrevious: () => setPage((current) => Math.max(1, current - 1)),
          onNext: () => setPage((current) => current + 1),
        }}
      />
    </ReportLayout>
  )
}
