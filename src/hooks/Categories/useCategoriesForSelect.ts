import { useQuery } from "@tanstack/react-query"

import { getCategories } from "@/services/category-service"
import type { Category } from "@/services/category-service"

type CategoriesForSelectResponse = {
  data: Category[]
}

function normalizeCategories(payload: unknown): Category[] {
  if (Array.isArray(payload)) return payload as Category[]

  const data = (payload as { data?: unknown })?.data
  if (Array.isArray(data)) return data as Category[]

  return []
}

export function useCategoriesForSelect() {
  return useQuery({
    queryKey: ["categories-for-select", "products"],
    queryFn: async (): Promise<CategoriesForSelectResponse> => {
      try {
        const primary = await getCategories({ page: 1, limit: 100 })
        return { data: normalizeCategories(primary) }
      } catch {
        // Fallback لبعض الإصدارات التي لا تدعم page/limit
        const fallback = await getCategories()
        return { data: normalizeCategories(fallback) }
      }
    },
  })
}
