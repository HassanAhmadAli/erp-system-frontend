import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createLoyaltyReward,
  deleteLoyaltyReward,
  getLoyaltyRewardById,
  getLoyaltyRewards,
  normalizeLoyaltyRewardsList,
  updateLoyaltyReward,
  type CreateLoyaltyRewardInput,
  type LoyaltyRewardsQuery,
  type UpdateLoyaltyRewardInput,
} from "@/services/loyalty-rewards-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidUuid } from "@/validation/helpers"

export function useLoyaltyRewards(params?: LoyaltyRewardsQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["loyalty-rewards", query],
    queryFn: async () =>
      normalizeLoyaltyRewardsList(
        await getLoyaltyRewards({ ...params, ...query }),
        query.limit,
        query.offset
      ),
  })
}

export function useLoyaltyRewardById(id: string) {
  return useQuery({
    queryKey: ["loyalty-reward", id],
    queryFn: () => getLoyaltyRewardById(id),
    enabled: isValidUuid(id),
  })
}

export function useCreateLoyaltyReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLoyaltyRewardInput) => createLoyaltyReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] })
    },
  })
}

export function useUpdateLoyaltyReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateLoyaltyRewardInput
    }) => {
      if (!isValidUuid(id)) throw new Error("Invalid loyalty reward id")
      return updateLoyaltyReward(id, data)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] })
      queryClient.invalidateQueries({ queryKey: ["loyalty-reward", id] })
    },
  })
}

export function useDeleteLoyaltyReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      if (!isValidUuid(id)) throw new Error("Invalid loyalty reward id")
      return deleteLoyaltyReward(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] })
    },
  })
}
