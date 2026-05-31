// import { Navigate } from "react-router-dom"

// export function ProtectedRoute({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const token = localStorage.getItem("token")

//   if (!token) {
//     return <Navigate to="/login" replace />
//   }

//   return children
// }
import { Navigate } from "react-router-dom"
import { getAccessToken } from "@/utils/auth-storage"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
