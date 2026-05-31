import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/view/components/layout/app-shell"
import { DashboardPage } from "@/view/pages/dashboard-page"
import { InventoryPage } from "@/view/pages/inventory-page"
import { LoginPage } from "@/view/pages/login-page"
import { AppRoutes } from "@/routes"

function App() {
  return <AppRoutes />
}

// export function App() {
//   return (

//     <Routes>
//    <AppRoutes />
//       {/* <Route path="/login" element={<LoginPage />} />
//       <Route element={<AppShell />}>
//         <Route path="/dashboard" element={<DashboardPage />} />
//         <Route path="/inventory" element={<InventoryPage />} />

//       </Route>
//       <Route path="*" element={<Navigate to="/login" replace />} /> */}
//     </Routes>

//   )
// }

export default App
