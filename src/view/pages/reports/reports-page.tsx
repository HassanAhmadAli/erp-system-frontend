import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  FileText,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  ReportHubCard,
  ReportLayout,
} from "@/view/components/reports/report-layout"

export function ReportsPage() {
  const { t } = useTranslation(["common", "pages"])

  const reportLinks = [
    {
      title: t("reports.summary", { ns: "pages" }),
      description: t("reports.summaryDesc", { ns: "pages" }),
      to: "/reports/summary",
      icon: FileText,
    },
    {
      title: t("reports.dashboard", { ns: "pages" }),
      description: t("reports.dashboardDesc", { ns: "pages" }),
      to: "/reports/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("reports.inventory", { ns: "pages" }),
      description: t("reports.inventoryDesc", { ns: "pages" }),
      to: "/reports/inventory",
      icon: Boxes,
    },
    {
      title: t("reports.sales", { ns: "pages" }),
      description: t("reports.salesDesc", { ns: "pages" }),
      to: "/reports/sales",
      icon: ShoppingCart,
    },
    {
      title: t("reports.purchases", { ns: "pages" }),
      description: t("reports.purchasesDesc", { ns: "pages" }),
      to: "/reports/purchases",
      icon: Receipt,
    },
    {
      title: t("reports.profitMargins", { ns: "pages" }),
      description: t("reports.profitMarginsDesc", { ns: "pages" }),
      to: "/reports/profit-margins",
      icon: BarChart3,
    },
  ]

  return (
    <ReportLayout
      title={t("reports.title", { ns: "pages" })}
      description={t("reports.hubSubtitle", { ns: "pages" })}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportLinks.map((item) => (
          <ReportHubCard key={item.to} {...item} />
        ))}
      </div>
    </ReportLayout>
  )
}
