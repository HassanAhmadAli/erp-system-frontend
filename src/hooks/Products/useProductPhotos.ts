import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteProductPhoto,
  listProductPhotos,
  normalizeProductPhotos,
  uploadProductPhoto,
  type ProductPhoto,
} from "@/services/product-service"

export function useProductPhotos(productId: number | null) {
  return useQuery({
    queryKey: ["product-photos", productId],
    queryFn: async () => {
      const res = await listProductPhotos(productId!)
      return normalizeProductPhotos(res)
    },
    enabled: !!productId,
  })
}

export function useUploadProductPhoto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      uploadProductPhoto(productId, file),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["product-photos", variables.productId],
      })
      qc.invalidateQueries({ queryKey: ["product", variables.productId] })
    },
  })
}

export function useDeleteProductPhoto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (photoId: number | string) => deleteProductPhoto(photoId),

    onSuccess: () => {
      // We can only invalidate the generic photo query keys; the product details
      // page will also refresh itself by reloading photos.
      // If the backend response includes productId later, we can tighten this.
      qc.invalidateQueries({ queryKey: ["product-photos"] })
    },
  })
}

export type { ProductPhoto }
