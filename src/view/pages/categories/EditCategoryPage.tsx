import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategoryById, updateCategory } from "@/services/category-service"
import { useState, useEffect } from "react"

export function EditCategoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(Number(id)),
    enabled: !!id,
  })

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (data) {
      setName(data.name)
      setDescription(data.description || "")
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: () =>
      updateCategory(Number(id), {
        name,
        description,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["category", id] })

      navigate("/categories")
    },
  })

  return (
    <div className="space-y-4 text-right">
      <h2 className="text-2xl font-bold">تعديل الصنف</h2>

      <input
        className="w-full rounded-xl border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        onClick={() => mutation.mutate()}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white"
      >
        حفظ التعديلات
      </button>
    </div>
  )
}
