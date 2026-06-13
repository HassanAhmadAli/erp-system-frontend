import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { asList } from "@/lib/list-utils"
import {
  createLoyaltyReward,
  deleteLoyaltyReward,
  getLoyaltyPolicy,
  getLoyaltyRewardById,
  getLoyaltyRewards,
  updateLoyaltyPolicy,
  updateLoyaltyReward,
  type CreateLoyaltyRewardInput,
  type LoyaltyPolicy,
  type UpdateLoyaltyRewardInput,
} from "@/services/loyalty-rewards-service"

export function useLoyaltyPolicy() {
  return useQuery({
    queryKey: ["loyalty-policy"],
    queryFn: getLoyaltyPolicy,
  })
}

export function useUpdateLoyaltyPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoyaltyPolicy) => updateLoyaltyPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-policy"] })
    },
  })
}

export function useLoyaltyRewards() {
  return useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: async () => asList(await getLoyaltyRewards()),
  })
}

export function useLoyaltyRewardById(id: string) {
  return useQuery({
    queryKey: ["loyalty-reward", id],
    queryFn: () => getLoyaltyRewardById(id),
    enabled: !!id,
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
    }) => updateLoyaltyReward(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] })
      queryClient.invalidateQueries({ queryKey: ["loyalty-reward", id] })
    },
  })
}

export function useDeleteLoyaltyReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLoyaltyReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] })
    },
  })
}
