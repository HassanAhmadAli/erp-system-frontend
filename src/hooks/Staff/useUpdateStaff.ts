import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateStaffProfile, type StaffProfile } from "@/services/staff-service"
import type { UpdateStaffProfilePayload } from "@/validation/staff-schema"

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateStaffProfilePayload
    }) => updateStaffProfile(id, data),

    onSuccess: (staff: StaffProfile, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      })
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
      queryClient.setQueryData(["staff", "detail", variables.id], staff)
    },

    onError: (error) => {
      console.error("Update staff failed", error)
    },
  })
}
