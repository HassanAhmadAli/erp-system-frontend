import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createAd,
  deleteAd,
  getAdById,
  getAds,
  normalizeAds,
  updateAd,
  type CreateAdInput,
  type UpdateAdInput,
} from "@/services/ads-service"

export function useAds(activeOnly = false) {
  return useQuery({
    queryKey: ["ads", activeOnly],
    queryFn: async () => {
      const response = await getAds(activeOnly)
      return normalizeAds(response)
    },
  })
}

export function useAdById(id: number) {
  return useQuery({
    queryKey: ["ads", id],
    queryFn: () => getAdById(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAdInput) => createAd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
    },
  })
}

export function useUpdateAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAdInput }) =>
      updateAd(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
      queryClient.invalidateQueries({ queryKey: ["ads", variables.id] })
    },
  })
}

export function useDeleteAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
    },
  })
}
