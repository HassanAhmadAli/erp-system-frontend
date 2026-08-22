import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteAdImage, uploadAdImage } from "@/services/ads-service"

function invalidateAdQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  adId: number
) {
  queryClient.invalidateQueries({ queryKey: ["ads"] })
  queryClient.invalidateQueries({ queryKey: ["ads", String(adId)] })
  queryClient.invalidateQueries({ queryKey: ["ads", adId] })
}

export function useUploadAdImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ adId, file }: { adId: number; file: File }) =>
      uploadAdImage(adId, file),

    onSuccess: (_data, variables) => {
      invalidateAdQueries(queryClient, variables.adId)
    },
  })
}

export function useDeleteAdImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (adId: number) => deleteAdImage(adId),

    onSuccess: (_data, adId) => {
      invalidateAdQueries(queryClient, adId)
    },
  })
}
