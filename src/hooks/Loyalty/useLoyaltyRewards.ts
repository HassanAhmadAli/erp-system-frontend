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
  type UpdateLoyaltyPolicyInput,
  type UpdateLoyaltyRewardInput,
} from "@/services/loyalty-rewards-service"
import { isValidId } from "@/validation/helpers"

export function useLoyaltyPolicy() {
  return useQuery({
    queryKey: ["loyalty-policy"],
    queryFn: getLoyaltyPolicy,
  })
}

export function useUpdateLoyaltyPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateLoyaltyPolicyInput) =>
      updateLoyaltyPolicy(data),
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
    enabled: isValidId(id),
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
      if (!isValidId(id)) throw new Error("Invalid loyalty reward id")
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
      if (!isValidId(id)) throw new Error("Invalid loyalty reward id")
      return deleteLoyaltyReward(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-rewards"] })
    },
  })
}
