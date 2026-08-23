import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteProductImage,
  getProductPhotoStoredFileId,
  listProductPhotos,
  normalizeProductPhotos,
  uploadProductPhoto,
  type Product,
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

function downloadUrl(storedFileId: string) {
  return `/product-photo/download/${storedFileId}`
}

function productImagePatchFromPhoto(
  photo: ProductPhoto
): Pick<Product, "imageUrl" | "productPhotos"> {
  const storedFileId = getProductPhotoStoredFileId(photo)
  return {
    imageUrl: storedFileId ? downloadUrl(storedFileId) : null,
    productPhotos: [photo],
  }
}

function patchProductImage(
  queryClient: ReturnType<typeof useQueryClient>,
  productId: number,
  patch: Partial<Pick<Product, "imageUrl" | "productPhotos">> | Product
) {
  const apply = (current: Product | undefined) =>
    current ? { ...current, ...patch } : current

  queryClient.setQueryData(["product", productId], apply)
  queryClient.setQueryData(["product", String(productId)], apply)
}

function invalidateProductMedia(
  queryClient: ReturnType<typeof useQueryClient>,
  productId: number
) {
  void queryClient.invalidateQueries({
    queryKey: ["product-photos", productId],
  })
  void queryClient.invalidateQueries({ queryKey: ["product", productId] })
  void queryClient.invalidateQueries({
    queryKey: ["product", String(productId)],
  })
  void queryClient.invalidateQueries({ queryKey: ["products"] })
  void queryClient.invalidateQueries({ queryKey: ["products-low-stock"] })
}

export function useUploadProductPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      uploadProductPhoto(productId, file),

    onSuccess: (data, variables) => {
      if (data && typeof data === "object" && "id" in data) {
        const photo = data as ProductPhoto
        patchProductImage(
          queryClient,
          variables.productId,
          productImagePatchFromPhoto(photo)
        )
        queryClient.setQueryData(
          ["product-photos", variables.productId],
          [photo]
        )
      }
      invalidateProductMedia(queryClient, variables.productId)
    },
  })
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: number) => deleteProductImage(productId),

    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["product", productId] })
      await queryClient.cancelQueries({
        queryKey: ["product", String(productId)],
      })
      await queryClient.cancelQueries({
        queryKey: ["product-photos", productId],
      })

      patchProductImage(queryClient, productId, {
        imageUrl: null,
        productPhotos: [],
      })
      queryClient.setQueryData(["product-photos", productId], [])
    },

    onSuccess: (_data, productId) => {
      patchProductImage(queryClient, productId, {
        imageUrl: null,
        productPhotos: [],
      })
      queryClient.setQueryData(["product-photos", productId], [])
      invalidateProductMedia(queryClient, productId)
    },
  })
}

export type { ProductPhoto }
