import {
  Building2,
  LineChart,
  PieChart,
  RefreshCw,
  TrendingUp,
} from "lucide-react"

import {
  ReportHubCard,
  ReportLayout,
} from "@/view/components/reports/report-layout"

const financialLinks = [
  {
    title: "هوامش الربح",
    description: "تحليل ربحية المنتجات ونسب الهامش",
    to: "/financial/profit-margins",
    icon: TrendingUp,
  },
  {
    title: "تفصيل التكاليف",
    description: "توزيع التكاليف حسب الفئات والمصادر",
    to: "/financial/cost-breakdown",
    icon: PieChart,
  },
  {
    title: "اتجاهات التكلفة",
    description: "تتبع تغير التكلفة عبر الزمن أو حسب المنتج",
    to: "/financial/cost-trends",
    icon: LineChart,
  },
  {
    title: "تقرير المورد",
    description: "تحليل التعاملات والتكاليف مع مورد محدد",
    to: "/financial/supplier-report",
    icon: Building2,
  },
  {
    title: "إعادة حساب التكاليف",
    description: "تحديث تكاليف المنتجات بعد تغيير الأسعار",
    to: "/financial/recalculate",
    icon: RefreshCw,
  },
]

export function FinancialPage() {
  return (
    <ReportLayout
      title="التحليل المالي"
      description="اختر نوع التحليل لعرضه في صفحة مخصصة مع مخططات توضيحية"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {financialLinks.map((item) => (
          <ReportHubCard key={item.to} {...item} />
        ))}
      </div>
    </ReportLayout>
  )
}
