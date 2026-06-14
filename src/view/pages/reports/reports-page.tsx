import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  FileText,
} from "lucide-react"

import {
  ReportHubCard,
  ReportLayout,
} from "@/view/components/reports/report-layout"

const reportLinks = [
  {
    title: "ملخص مالي",
    description: "نظرة سريعة على المبيعات والمشتريات والمصروفات والربح",
    to: "/reports/summary",
    icon: FileText,
  },
  {
    title: "لوحة التحكم",
    description: "مؤشرات الأداء الرئيسية مع مخططات بيانية",
    to: "/reports/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "تقرير المخزون",
    description: "حالة المخزون والمنتجات منخفضة الكمية",
    to: "/reports/inventory",
    icon: Boxes,
  },
  {
    title: "تقرير المبيعات",
    description: "تحليل فواتير المبيعات ومخطط الإيرادات",
    to: "/reports/sales",
    icon: ShoppingCart,
  },
  {
    title: "تقرير المشتريات",
    description: "تحليل فواتير الشراء وتكاليف التوريد",
    to: "/reports/purchases",
    icon: Receipt,
  },
  {
    title: "هوامش الربح",
    description: "ربحية المنتجات ونسب الهامش",
    to: "/reports/profit-margins",
    icon: BarChart3,
  },
]

export function ReportsPage() {
  return (
    <ReportLayout
      title="التقارير"
      description="اختر نوع التقرير لعرضه في صفحة مخصصة مع مخططات واضحة"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportLinks.map((item) => (
          <ReportHubCard key={item.to} {...item} />
        ))}
      </div>
    </ReportLayout>
  )
}
