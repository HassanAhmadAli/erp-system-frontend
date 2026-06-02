import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import { AppShell } from "@/view/components/layout/app-shell"
import { ProtectedRoute } from "./ProtectedRoute"

import { LoginPage } from "@/view/pages/login-page"
import { DashboardPage } from "@/view/pages/dashboard-page"
import { InventoryPage } from "@/view/pages/inventory-page"
import { CategoriesPage } from "@/view/pages/categories/categories-page"
import { CreateCategoryForm } from "@/view/pages/categories/create-category-form"
import { EditCategoryPage } from "@/view/pages/categories/EditCategoryPage"
import { CategoryDetailsPage } from "@/view/pages/categories/CategoryDetailsPage"
import { SuppliersPage } from "@/view/pages/suppliers/SuppliersPage"
import { CreateSupplierPage } from "@/view/pages/suppliers/create-supplier-page"
import { ProductsPage } from "@/view/pages/products/products-page"
import { CreateProductPage } from "@/view/pages/products/create-product-page"
import { ProductDetailsPage } from "@/view/pages/products/product-details-page"
import { EditProductPage } from "@/view/pages/products/edit-product-page"
import { ProductPhotosPage } from "@/view/pages/products/product-photos-page"
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
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Main Modules */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/create" element={<CreateCategoryPage />} />
        <Route path="categories/:id" element={<CategoryDetailsPage />} />
        <Route path="categories/:id/edit" element={<EditCategoryPage />} />
        <Route path="suppliers/create" element={<CreateSupplierPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="products/:id/edit" element={<EditProductPage />} />
        <Route path="products/:id/photos" element={<ProductPhotosPage />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}
