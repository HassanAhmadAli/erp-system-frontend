import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createStaff } from "@/services/staff-service"

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStaff,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      })
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
    },

    onError: (error) => {
      console.error("Create staff failed", error)
    },
  })
}
