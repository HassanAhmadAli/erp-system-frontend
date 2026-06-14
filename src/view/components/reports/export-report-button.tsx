import { Download } from "lucide-react"

import { useExportReport } from "@/hooks/Reports/useReports"
import type {
  ReportDateRange,
  ReportExportType,
} from "@/services/report-service"
import { Button } from "@/view/components/ui/button"

type ExportReportButtonProps = {
  type: ReportExportType
  label: string
  params?: ReportDateRange
}

export function ExportReportButton({
  type,
  label,
  params,
}: ExportReportButtonProps) {
  const exportMutation = useExportReport()

  async function handleExport() {
    try {
      const blob = await exportMutation.mutateAsync({ type, params })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${type}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("فشل تصدير التقرير")
    }
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      disabled={exportMutation.isPending}
      onClick={handleExport}
    >
      <Download className="size-4" />
      {label}
    </Button>
  )
}
