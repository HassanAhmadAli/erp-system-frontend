import { createCategory } from "@/services/category-service"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

const inputClass =
  "w-full rounded-xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-3 text-right outline-none"

export function CreateCategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error" | ""
    text: string
  }>({ type: "", text: "" })

  const queryClient = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setMessage({ type: "", text: "" })

    if (!name.trim()) {
      setMessage({ type: "error", text: "اسم التصنيف مطلوب" })
      return
    }

    try {
      setLoading(true)

      await createCategory({
        name,
        description,
      })

      setName("")
      setDescription("")

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      })

      setMessage({
        type: "success",
        text: "تم إضافة الصنف بنجاح",
      })

      onSuccess()

      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 3000)
    } catch {
      setMessage({
        type: "error",
        text: "فشل إضافة الصنف، حاول مرة أخرى",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-6 text-right"
      dir="rtl"
    >
      {message.text && (
        <div
          className={`rounded-xl p-3 text-center text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label
          htmlFor="category-name"
          className="mb-2 block text-sm font-medium"
        >
          اسم التصنيف
        </label>
        <input
          id="category-name"
          className={inputClass}
          placeholder="أدخل اسم التصنيف"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="category-description"
          className="mb-2 block text-sm font-medium"
        >
          الوصف
        </label>
        <input
          id="category-description"
          className={inputClass}
          placeholder="أدخل وصف التصنيف (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl px-4 py-2 text-white transition ${
          loading
            ? "cursor-not-allowed bg-gray-400"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "جاري الإضافة..." : "إضافة التصنيف"}
      </button>
    </form>
  )
}
