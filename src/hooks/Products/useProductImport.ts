import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getProductImportJob,
  getProductImportJobs,
  importProducts,
} from "@/services/product-service"

export function useProductImportJobs() {
  return useQuery({
    queryKey: ["product-import-jobs"],
    queryFn: getProductImportJobs,
  })
}

export function useProductImportJob(jobId: number | string | null) {
  return useQuery({
    queryKey: ["product-import-job", jobId],
    queryFn: () => getProductImportJob(jobId!),
    enabled: !!jobId,
  })
}

export function useImportProductsMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => importProducts(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-import-jobs"] })
    },
  })
}
