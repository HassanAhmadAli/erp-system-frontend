import type { PaginatedResponse } from "@/api/client"

export const DEFAULT_PAGE_SIZE = 10

export type PaginationParams = {
  page?: number
  limit?: number
  offset?: number
  search?: string
}

export function pageToOffset(page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_PAGE_SIZE

  return Math.max(0, (safePage - 1) * safeLimit)
}

export function toPaginationQuery(params?: PaginationParams) {
  const limit =
    params?.limit != null && params.limit > 0
      ? Math.floor(params.limit)
      : DEFAULT_PAGE_SIZE

  const offset =
    params?.offset != null && params.offset >= 0
      ? Math.floor(params.offset)
      : pageToOffset(params?.page ?? 1, limit)

  return {
    limit,
    offset,
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
  }
}

export function normalizePaginatedResponse<T>(
  response: PaginatedResponse<T> | T[] | null | undefined,
  fallbackLimit = DEFAULT_PAGE_SIZE,
  fallbackOffset = 0
): PaginatedResponse<T> {
  if (!response) {
    return {
      data: [],
      total: 0,
      limit: fallbackLimit,
      offset: fallbackOffset,
      isFinalPage: true,
    }
  }

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      limit: response.length || fallbackLimit,
      offset: 0,
      isFinalPage: true,
    }
  }

  const data = response.data ?? []
  const limit = response.limit ?? fallbackLimit
  const offset = response.offset ?? fallbackOffset
  const total = response.total ?? data.length
  const isFinalPage =
    response.isFinalPage ?? (offset + limit >= total || data.length < limit)

  return {
    data,
    total,
    limit,
    offset,
    isFinalPage,
  }
}
