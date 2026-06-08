export function ConfirmDialog({
  open,
  title = "هل أنت متأكد؟",
  onClose,
  onConfirm,
}: any) {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-[400px] rounded-2xl bg-white p-6">
        <h2 className="mb-4 font-bold">{title}</h2>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>إلغاء</button>

          <button onClick={onConfirm} className="text-red-600">
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}
