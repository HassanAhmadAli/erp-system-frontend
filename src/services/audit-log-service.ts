import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import i18n from "@/i18n"

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

const AUDIT_ACTION_KEYS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
] as const

const AUDIT_ENTITY_KEYS = [
  "Order",
  "Product",
  "Supplier",
  "Category",
  "Purchase",
  "Expense",
  "Customer",
  "Discount",
] as const

const AUDIT_ROLE_KEYS = [
  "STORE_MANAGER",
  "CASHIER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const

export function formatAuditAction(action: string): string {
  const key = action.toUpperCase()

  if ((AUDIT_ACTION_KEYS as readonly string[]).includes(key)) {
    return i18n.t(`pages:auditLogs.actions.${key}`)
  }

  return action
}

export function formatAuditEntity(entity: string): string {
  if ((AUDIT_ENTITY_KEYS as readonly string[]).includes(entity)) {
    return i18n.t(`pages:auditLogs.entities.${entity}`)
  }

  return entity
}

export function formatAuditRole(role: string): string {
  if ((AUDIT_ROLE_KEYS as readonly string[]).includes(role)) {
    return i18n.t(`nav:roles.${role}`)
  }

  return role
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

  const text = parts.join(", ")
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
