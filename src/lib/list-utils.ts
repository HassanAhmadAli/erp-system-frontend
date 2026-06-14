export function asList<T>(
  response: T[] | { data: T[] } | null | undefined
): T[] {
  if (!response) return []
  if (Array.isArray(response)) return response
  if (Array.isArray(response.data)) return response.data
  return []
}
