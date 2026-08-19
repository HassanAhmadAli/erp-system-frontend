import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteStaff } from "@/services/staff-service"

export function useDeleteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteStaff(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff"],
      })
      queryClient.invalidateQueries({
        queryKey: ["users"],
      })
    },

    onError: (error) => {
      console.error("Delete staff failed", error)
    },
  })
}
