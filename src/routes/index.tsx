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

import { OrdersPage } from "@/view/pages/orders/orders-page"
import { OrderDetailsPage } from "@/view/pages/orders/order-details-page"

import { SalesInvoicesPage } from "@/view/pages/sales-invoices/sales-invoices-page"
import { SalesInvoiceDetailsPage } from "@/view/pages/sales-invoices/sales-invoice-details-page"

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

        {/* Ads */}
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
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}