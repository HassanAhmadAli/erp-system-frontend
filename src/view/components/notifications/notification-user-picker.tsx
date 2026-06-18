import { useMemo, useState } from "react"
import { Loader2, Search, Users } from "lucide-react"

import { useUsers } from "@/hooks/useUsers"
import type { UserProfile, UserRole } from "@/services/user-service"
import { targetRoleLabels } from "@/view/components/notifications/notification-target-labels"

const userRoleLabels: Record<UserRole, string> = {
  ...targetRoleLabels,
  CUSTOMER: "عميل",
}

type NotificationUserPickerProps = {
  selectedUserIds: number[]
  onChange: (userIds: number[]) => void
}

function formatUserRole(role: UserRole) {
  return userRoleLabels[role] ?? role
}

export function NotificationUserPicker({
  selectedUserIds,
  onChange,
}: NotificationUserPickerProps) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL")

  const { data: users = [], isLoading, isError } = useUsers({ limit: 100 })

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter
      const matchesSearch =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)

      return matchesRole && matchesSearch
    })
  }, [users, search, roleFilter])

  function toggleUser(userId: number) {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId))
      return
    }

    onChange([...selectedUserIds, userId])
  }

  function selectAllVisible() {
    const visibleIds = filteredUsers.map((user) => user.id)
    const merged = new Set([...selectedUserIds, ...visibleIds])
    onChange(Array.from(merged))
  }

  function clearSelection() {
    onChange([])
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--erp-border)] bg-[color-mix(in_srgb,var(--erp-card)_96%,var(--erp-text))] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-right">
          <Users className="h-4 w-4 text-[var(--erp-accent)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--erp-text)]">
              اختيار المستخدمين
            </p>
            <p className="text-xs text-[var(--erp-text)]/65">
              {selectedUserIds.length > 0
                ? `تم اختيار ${selectedUserIds.length} مستخدم`
                : "اختر مستخدم واحد أو أكثر من القائمة"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAllVisible}
            className="rounded-xl border border-[var(--erp-border)] px-3 py-1.5 text-xs text-[var(--erp-text)]/80 hover:bg-[var(--erp-nav-active-bg)]"
          >
            تحديد المعروض
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-xl border border-[var(--erp-border)] px-3 py-1.5 text-xs text-[var(--erp-text)]/80 hover:bg-[var(--erp-nav-active-bg)]"
          >
            إلغاء التحديد
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--erp-text)]/45" />
          <input
            type="search"
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent py-2.5 ps-10 pe-4 text-sm outline-none"
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(event.target.value as UserRole | "ALL")
          }
          className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-2.5 text-sm outline-none"
        >
          <option value="ALL">كل الأدوار</option>
          {(Object.keys(userRoleLabels) as UserRole[]).map((role) => (
            <option key={role} value={role}>
              {userRoleLabels[role]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--erp-accent)]" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">
          تعذر تحميل قائمة المستخدمين. تأكد من صلاحياتك.
        </p>
      ) : filteredUsers.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--erp-text)]/65">
          لا يوجد مستخدمون مطابقون للبحث.
        </p>
      ) : (
        <div className="max-h-[320px] space-y-2 overflow-y-auto pe-1">
          {filteredUsers.map((user) => (
            <UserPickerRow
              key={user.id}
              user={user}
              selected={selectedUserIds.includes(user.id)}
              onToggle={() => toggleUser(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type UserPickerRowProps = {
  user: UserProfile
  selected: boolean
  onToggle: () => void
}

function UserPickerRow({ user, selected, onToggle }: UserPickerRowProps) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 transition-colors ${
        selected
          ? "border-[var(--erp-accent)]/30 bg-[color-mix(in_srgb,var(--erp-accent)_8%,var(--erp-card))]"
          : "border-[var(--erp-border)] hover:bg-[var(--erp-nav-active-bg)]"
      }`}
    >
      <div className="min-w-0 flex-1 text-right">
        <p className="truncate font-medium text-[var(--erp-text)]">
          {user.fullName.trim()}
        </p>
        <p className="truncate text-xs text-[var(--erp-text)]/65">
          {user.email}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-full bg-[var(--erp-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--erp-accent)]">
          {formatUserRole(user.role)}
        </span>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="size-4 accent-[var(--erp-accent)]"
        />
      </div>
    </label>
  )
}
