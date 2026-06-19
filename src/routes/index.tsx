import { Navigate, Route, Routes, useNavigate } from "react-router-dom"

import { AppShell } from "@/view/components/layout/app-shell"
import { ProtectedRoute } from "./ProtectedRoute"

import { LoginPage } from "@/view/pages/login-page"
import { StoreManagerOverviewPage } from "@/view/pages/overview/store-manager-ov"
import { InventoryPage } from "@/view/pages/inventory-page"

import { CategoriesPage } from "@/view/pages/categories/categories-page"
import { CreateCategoryForm } from "@/view/pages/categories/create-category-form"
import { EditCategoryPage } from "@/view/pages/categories/EditCategoryPage"
import { CategoryDetailsPage } from "@/view/pages/categories/CategoryDetailsPage"

import { SuppliersPage } from "@/view/pages/suppliers/SuppliersPage"
import { CreateSupplierPage } from "@/view/pages/suppliers/create-supplier-page"
import { SupplierDetailsPage } from "@/view/pages/suppliers/supplier-details-page"
import { EditSupplierPage } from "@/view/pages/suppliers/edit-supplier-page"

import { ProductsPage } from "@/view/pages/products/products-page"
import { ProductImportPage } from "@/view/pages/products/product-import-page"
import { CreateProductPage } from "@/view/pages/products/create-product-page"
import { ProductDetailsPage } from "@/view/pages/products/product-details-page"
import { EditProductPage } from "@/view/pages/products/edit-product-page"
import { ProductPhotosPage } from "@/view/pages/products/product-photos-page"

import { CustomersPage } from "@/view/pages/customers/customers-page"
import { CustomerDetailsPage } from "@/view/pages/customers/customer-details-page"


import { DiscountsPage } from "@/view/pages/discounts/discounts-page"
import { ActiveDiscountsPage } from "@/view/pages/discounts/active-discounts-page"
import { DiscountDetailsPage } from "@/view/pages/discounts/discount-details-page"
import { CreateDiscountPage } from "@/view/pages/discounts/create-discount-page"
import { EditDiscountPage } from "@/view/pages/discounts/update-discount-page"
import { BestDiscountPage } from "@/view/pages/discounts/best-discount-page"
import { CalculateDiscountPage } from "@/view/pages/discounts/calculate-discount-page"

import { AdsPage } from "@/view/pages/ads/ads-page"
import { CreateAdPage } from "@/view/pages/ads/create-ad-page"

import { OrderDetailsPage } from "@/view/pages/orders/order-details-page"

import { SalesInvoicesPage } from "@/view/pages/sales-invoices/sales-invoices-page"
import { SalesInvoiceDetailsPage } from "@/view/pages/sales-invoices/sales-invoice-details-page"

import { PurchaseInvoicesPage } from "@/view/pages/purchase-invoices/purchase-invoices-page"
import { PurchaseInvoiceDetailsPage } from "@/view/pages/purchase-invoices/purchase-invoice-details-page"

import { PosPage } from "@/view/pages/pos/pos-page"
import { AccountantOverviewPage } from "@/view/pages/overview/accountant-ov"
import { ExpensesPage } from "@/view/pages/expenses/expenses-page"
import { CreateExpensePage } from "@/view/pages/expenses/create-expense-page"
import { ExpenseDetailsPage } from "@/view/pages/expenses/expense-details-page"
import { EditExpensePage } from "@/view/pages/expenses/edit-expense-page"
// import { PurchasesPage } from "@/view/pages/purchases/purchases-page"
// import { CreatePurchasePage } from "@/view/pages/purchases/create-purchase-page"
// import { PurchaseDetailsPage } from "@/view/pages/purchases/purchase-details-page"
import { ReportsPage } from "@/view/pages/reports/reports-page"
import { ReportSummaryPage } from "@/view/pages/reports/report-summary-page"
import { ReportDashboardPage } from "@/view/pages/reports/report-dashboard-page"
import { ReportInventoryPage } from "@/view/pages/reports/report-inventory-page"
import { ReportSalesPage } from "@/view/pages/reports/report-sales-page"
import { ReportPurchasesPage } from "@/view/pages/reports/report-purchases-page"
import { ReportProfitMarginsPage } from "@/view/pages/reports/report-profit-margins-page"
import { LoyaltyRewardsPage } from "@/view/pages/loyalty/loyalty-rewards-page"
import { FinancialPage } from "@/view/pages/financial/financial-page"
import { ProfitMarginsPage } from "@/view/pages/financial/profit-margins-page"
import { CostBreakdownPage } from "@/view/pages/financial/cost-breakdown-page"
import { CostTrendsPage } from "@/view/pages/financial/cost-trends-page"
import { SupplierReportPage } from "@/view/pages/financial/supplier-report-page"
import { RecalculateCostsPage } from "@/view/pages/financial/recalculate-costs-page"
import { AuditLogsPage } from "@/view/pages/audit-logs/audit-logs-page"
import { AuditLogDetailsPage } from "@/view/pages/audit-logs/audit-log-details-page"
// import { SalesPage } from "@/view/pages/sales/sales-page"
// import { SalesDetailsPage } from "@/view/pages/sales/sales-details-page"
import { NotificationsPage } from "@/view/pages/notifications/notifications-page"

function CreateCategoryPage() {
  const navigate = useNavigate()

  return (
    <CreateCategoryForm
      onSuccess={() => {
        navigate("/categories")
      }}
    />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected App */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="/overview" replace />} />

        {/* Overview */}
        <Route path="overview" element={<StoreManagerOverviewPage />} />
        <Route
          path="accountant/overview"
          element={<AccountantOverviewPage />}
        />

        {/* POS */}
        <Route path="pos" element={<PosPage />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailsPage />} />

        {/* Orders */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />

        {/* Sales Invoices */}
        <Route path="sales-invoices" element={<SalesInvoicesPage />} />
        <Route
          path="sales-invoices/:id"
          element={<SalesInvoiceDetailsPage />}
        />

        {/* Purchase Invoices */}
        <Route path="purchase-invoices" element={<PurchaseInvoicesPage />} />
        <Route
          path="purchase-invoices/:id"
          element={<PurchaseInvoiceDetailsPage />}
        />

        {/* Ads */}
        {/* Orders Module */}
        {/* <Route path="orders" element={<OrdersPage />} /> */}

        {/* Ads Module */}
        <Route path="ads" element={<AdsPage />} />
        <Route path="ads/create" element={<CreateAdPage />} />

        {/* Inventory */}
        <Route path="inventory" element={<InventoryPage />} />

        {/* Categories */}
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/create" element={<CreateCategoryPage />} />
        <Route path="categories/:id" element={<CategoryDetailsPage />} />
        <Route path="categories/:id/edit" element={<EditCategoryPage />} />

        {/* Suppliers */}
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/create" element={<CreateSupplierPage />} />
        <Route path="suppliers/:id" element={<SupplierDetailsPage />} />
        <Route path="suppliers/:id/edit" element={<EditSupplierPage />} />

        {/* Products */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/import" element={<ProductImportPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />
        <Route path="products/:id/photos" element={<ProductPhotosPage />} />

        {/* Discounts */}
        <Route path="discounts" element={<DiscountsPage />} />
        <Route path="discounts/active" element={<ActiveDiscountsPage />} />
        <Route path="discounts/best" element={<BestDiscountPage />} />
        <Route path="discounts/calculate" element={<CalculateDiscountPage />} />
        <Route path="discounts/create" element={<CreateDiscountPage />} />
        <Route path="discounts/:id" element={<DiscountDetailsPage />} />
        <Route path="discounts/:id/edit" element={<EditDiscountPage />} />

        {/* Accountant Modules */}
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="expenses/create" element={<CreateExpensePage />} />
        <Route path="expenses/:id" element={<ExpenseDetailsPage />} />
        <Route path="expenses/:id/edit" element={<EditExpensePage />} />
        {/* 
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/create" element={<CreatePurchasePage />} />
        <Route path="purchases/:id" element={<PurchaseDetailsPage />} />

        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/:id" element={<SalesDetailsPage />} /> */}

        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/summary" element={<ReportSummaryPage />} />
        <Route path="reports/dashboard" element={<ReportDashboardPage />} />
        <Route path="reports/inventory" element={<ReportInventoryPage />} />
        <Route path="reports/sales" element={<ReportSalesPage />} />
        <Route path="reports/purchases" element={<ReportPurchasesPage />} />
        <Route
          path="reports/profit-margins"
          element={<ReportProfitMarginsPage />}
        />

        <Route path="financial" element={<FinancialPage />} />
        <Route
          path="financial/profit-margins"
          element={<ProfitMarginsPage />}
        />
        <Route
          path="financial/cost-breakdown"
          element={<CostBreakdownPage />}
        />
        <Route path="financial/cost-trends" element={<CostTrendsPage />} />
        <Route
          path="financial/supplier-report"
          element={<SupplierReportPage />}
        />
        <Route
          path="financial/recalculate"
          element={<RecalculateCostsPage />}
        />
        <Route path="loyalty-rewards" element={<LoyaltyRewardsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="audit-logs/:id" element={<AuditLogDetailsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}
