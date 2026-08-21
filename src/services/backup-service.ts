import { apiRequest } from "@/api/client"

export type CreateBackupResponse = {
  message?: string
}

export function createBackup() {
  return apiRequest<CreateBackupResponse>("/backup/create", {
    method: "POST",
  })
}
