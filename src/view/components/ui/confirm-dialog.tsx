export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="rounded-2xl bg-white p-6">
        <p className="mb-4">هل أنت متأكد من الحذف؟</p>
        <div className="flex gap-2">
          <button onClick={onClose}>إلغاء</button>
          <button onClick={onConfirm} className="text-red-600">
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}
