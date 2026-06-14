import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"

export type AuditLogUser = {
  id: number
  fullName: string
  email: string
  role: string
}

export type AuditLog = {
  id: number
  userId: number
  action: string
  entity: string
  entityId: number
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  performedAt: string
  user: AuditLogUser
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "إنشاء",
  UPDATE: "تحديث",
  DELETE: "حذف",
  LOGIN: "تسجيل دخول",
  LOGOUT: "تسجيل خروج",
}

const ENTITY_LABELS: Record<string, string> = {
  Order: "طلب",
  Product: "منتج",
  Supplier: "مورد",
  Category: "تصنيف",
  Purchase: "فاتورة شراء",
  Expense: "مصروف",
  Customer: "عميل",
  Discount: "خصم",
}

const ROLE_LABELS: Record<string, string> = {
  STORE_MANAGER: "مدير المتجر",
  CASHIER: "كاشير",
  ACCOUNTANT: "محاسب",
  WAREHOUSE_WORKER: "عامل مستودع",
}

export function formatAuditAction(action: string): string {
  return ACTION_LABELS[action.toUpperCase()] ?? action
}

export function formatAuditEntity(entity: string): string {
  return ENTITY_LABELS[entity] ?? entity
}

export function formatAuditRole(role: string): string {
  return ROLE_LABELS[role] ?? role
}

export function formatAuditValue(
  value: Record<string, unknown> | null
): string {
  if (!value) return "—"
  return JSON.stringify(value, null, 2)
}

export function auditChangePreview(log: AuditLog, maxLength = 80): string {
  const parts: string[] = []

  if (log.oldValue) {
    for (const [key, val] of Object.entries(log.oldValue)) {
      parts.push(`${key}: ${String(val)}`)
    }
  }

  if (log.newValue) {
    for (const [key, val] of Object.entries(log.newValue)) {
      const newPart = `${key}: ${String(val)}`
      if (!parts.some((p) => p.startsWith(`${key}:`))) {
        parts.push(newPart)
      }
    }
  }

  if (parts.length === 0) return "—"

  const text = parts.join("، ")
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

export function getAuditLogs(params?: { limit?: number; offset?: number }) {
  return apiRequest<PaginatedResponse<AuditLog>>(
    `/audit-logs${buildQuery(params)}`
  )
}

export async function findAuditLogById(id: number): Promise<AuditLog> {
  const limit = 50
  let offset = 0

  while (true) {
    const response = await getAuditLogs({ limit, offset })
    const log = response.data.find((item) => item.id === id)
    if (log) return log

    if (response.isFinalPage) break
    offset += limit
  }

  throw new Error("Audit log not found")
}
