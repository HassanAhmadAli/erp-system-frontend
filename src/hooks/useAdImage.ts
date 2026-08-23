import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteAdImage, uploadAdImage, type Ad } from "@/services/ads-service"

function patchAdImage(
  queryClient: ReturnType<typeof useQueryClient>,
  adId: number,
  patch: Partial<Pick<Ad, "imageUrl" | "storedFileId">> | Ad
) {
  const apply = (current: Ad | undefined) =>
    current ? { ...current, ...patch } : current

  queryClient.setQueryData(["ads", adId], apply)
  queryClient.setQueryData(["ads", String(adId)], apply)
}

function invalidateAdQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  adId: number
) {
  void queryClient.invalidateQueries({ queryKey: ["ads"] })
  void queryClient.invalidateQueries({ queryKey: ["ads", String(adId)] })
  void queryClient.invalidateQueries({ queryKey: ["ads", adId] })
}

export function useUploadAdImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ adId, file }: { adId: number; file: File }) =>
      uploadAdImage(adId, file),

    onSuccess: (data, variables) => {
      if (data && typeof data === "object" && "id" in data) {
        patchAdImage(queryClient, variables.adId, data)
      }
      invalidateAdQueries(queryClient, variables.adId)
    },
  })
}

export function useDeleteAdImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (adId: number) => deleteAdImage(adId),

    onMutate: async (adId) => {
      await queryClient.cancelQueries({ queryKey: ["ads", adId] })
      await queryClient.cancelQueries({ queryKey: ["ads", String(adId)] })

      patchAdImage(queryClient, adId, {
        imageUrl: null,
        storedFileId: null,
      })
    },

    onSuccess: (_data, adId) => {
      patchAdImage(queryClient, adId, {
        imageUrl: null,
        storedFileId: null,
      })
      invalidateAdQueries(queryClient, adId)
    },
  })
}
