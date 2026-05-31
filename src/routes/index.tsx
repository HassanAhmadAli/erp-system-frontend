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
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}
