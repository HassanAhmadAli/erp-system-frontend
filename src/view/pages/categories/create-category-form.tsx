// import { useState } from "react"
// import { createCategory } from "@/services/category-service"

// export function CreateCategoryForm({
//   onSuccess,
// }: {
//   onSuccess: () => void
// }) {
//   const [name, setName] = useState("")
//   const [description, setDescription] = useState("")

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()

//     await createCategory({
//       name,
//       description,
//     })

//     setName("")
//     setDescription("")
//     onSuccess()
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-3">
//       <input
//         className="w-full rounded-xl border p-2 text-right"
//         placeholder="اسم التصنيف"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//       />

//       <input
//         className="w-full rounded-xl border p-2 text-right"
//         placeholder="الوصف"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />

//       <button className="rounded-xl bg-green-600 px-4 py-2 text-white">
//         إضافة
//       </button>
//     </form>
//   )
// }

import { createCategory } from "@/services/category-service"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

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

      // reset form
      setName("")
      setDescription("")

      // refresh list
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      })

      // success UI message
      setMessage({
        type: "success",
        text: "تم إضافة الصنف بنجاح 🎉",
      })

      // optional callback (مثلاً إغلاق modal)
      onSuccess()

      // hide message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 3000)
    } catch (err: any) {
      setMessage({
        type: "error",
        text: "فشل إضافة الصنف، حاول مرة أخرى",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* MESSAGE */}
      {message.text && (
        <div
          className={`rounded-xl p-2 text-center text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <input
        className="w-full rounded-xl border p-2 text-right"
        placeholder="اسم التصنيف"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-2 text-right"
        placeholder="الوصف"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        disabled={loading}
        className={`w-full rounded-xl px-4 py-2 text-white transition ${
          loading
            ? "cursor-not-allowed bg-gray-400"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "جاري الإضافة..." : "إضافة"}
      </button>
    </form>
  )
}
