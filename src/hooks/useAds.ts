import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createAd,
  deleteAd,
  getAdById,
  getAds,
  normalizeAdsList,
  updateAd,
  type AdsQuery,
  type CreateAdInput,
  type UpdateAdInput,
} from "@/services/ads-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"

export function useAds(params: AdsQuery | boolean = false) {
  const normalized =
    typeof params === "boolean" ? { activeOnly: params } : (params ?? {})
  const { activeOnly = false, ...pagination } = normalized
  const query = toPaginationQuery(pagination)

  return useQuery({
    queryKey: ["ads", activeOnly, query],
    queryFn: async () =>
      normalizeAdsList(
        await getAds({ ...pagination, activeOnly, ...query }),
        query.limit,
        query.offset
      ),
  })
}

export function useAdById(id: number) {
  return useQuery({
    queryKey: ["ads", id],
    queryFn: () => getAdById(id),
    enabled: isValidId(id),
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
