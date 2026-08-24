import { Building2, LineChart, PieChart, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  ReportHubCard,
  ReportLayout,
} from "@/view/components/reports/report-layout"

export function FinancialPage() {
  const { t } = useTranslation(["common", "pages"])

  const financialLinks = [
    {
      title: t("financial.profitMargins", { ns: "pages" }),
      description: t("financial.profitMarginsDesc", { ns: "pages" }),
      to: "/financial/profit-margins",
      icon: TrendingUp,
    },
    {
      title: t("financial.costBreakdown", { ns: "pages" }),
      description: t("financial.costBreakdownDesc", { ns: "pages" }),
      to: "/financial/cost-breakdown",
      icon: PieChart,
    },
    {
      title: t("financial.costTrends", { ns: "pages" }),
      description: t("financial.costTrendsDesc", { ns: "pages" }),
      to: "/financial/cost-trends",
      icon: LineChart,
    },
    {
      title: t("financial.supplierReport", { ns: "pages" }),
      description: t("financial.supplierReportDesc", { ns: "pages" }),
      to: "/financial/supplier-report",
      icon: Building2,
    },
  ]

  return (
    <ReportLayout
      title={t("financial.title", { ns: "pages" })}
      description={t("financial.hubSubtitle", { ns: "pages" })}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {financialLinks.map((item) => (
          <ReportHubCard key={item.to} {...item} />
        ))}
      </div>
    </ReportLayout>
  )
}
