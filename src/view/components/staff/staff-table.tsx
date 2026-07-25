import { useState } from "react"
import { Link } from "react-router-dom"

import { PERMISSIONS } from "@/auth/permissions"
import { useDeleteStaff } from "@/hooks/Staff/useDeleteStaff"
import { useStaff } from "@/hooks/Staff/useStaff"
import {
  STAFF_ROLE_LABELS,
  STAFF_ROLES,
  formatStaffRole,
  type StaffRole,
} from "@/services/staff-service"
import { formatNumber } from "@/utils/number-formatters"
import { Can } from "@/view/components/auth/can"
import { Button } from "@/view/components/ui/button"

const selectClass =
  "rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

export function StaffTable() {
  const [roleFilter, setRoleFilter] = useState<StaffRole | "ALL">("ALL")
  const { data, isLoading, error } = useStaff(
    roleFilter === "ALL" ? undefined : { role: roleFilter }
  )
  const deleteMutation = useDeleteStaff()

  const staff = data ?? []

  function handleDeleteStaff(id: number, name: string) {
    const shouldDelete = window.confirm(
      `هل أنت متأكد من حذف حساب الموظف "${name}"؟`
    )

    if (!shouldDelete) return

    deleteMutation.mutate(id)
  }

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            قائمة الموظفين
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            عدد الموظفين: {formatNumber(staff.length)}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--erp-muted)]">
          <span>تصفية حسب الدور</span>
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as StaffRole | "ALL")
            }
            className={selectClass}
          >
            <option value="ALL">الكل</option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {STAFF_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && (
        <p className="text-sm text-[var(--erp-muted)]">جاري التحميل...</p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          حدث خطأ في تحميل الموظفين
        </p>
      )}

      {!isLoading && !error && staff.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <p className="text-sm text-[var(--erp-muted)]">
            لا يوجد موظفون حالياً.
          </p>

          <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
            <Link
              to="/staff/create"
              className="mt-4 inline-flex rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:!text-[#24114f]"
            >
              إضافة أول موظف
            </Link>
          </Can>
        </div>
      )}

      {!isLoading && !error && staff.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
          <table className="w-full min-w-[720px] table-fixed text-right text-sm">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
            </colgroup>

            <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
              <tr>
                <th className="px-3 py-3 font-medium">الاسم</th>
                <th className="px-3 py-3 font-medium">البريد الإلكتروني</th>
                <th className="px-3 py-3 font-medium">الهاتف</th>
                <th className="px-3 py-3 font-medium">الدور</th>
                <th className="px-3 py-3 font-medium">المسمى الوظيفي</th>
                <th className="px-3 py-3 text-center font-medium">إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                >
                  <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                    <span className="block truncate">{member.fullName}</span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">{member.email}</span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">{member.phoneNumber}</span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">
                      {formatStaffRole(member.role)}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">
                      {member.jobTitle || "—"}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <Link to={`/staff/${member.id}`}>
                        <Button variant="outline" size="xs">
                          عرض
                        </Button>
                      </Link>

                      <Can permission={PERMISSIONS.EMPLOYEE_MANAGE}>
                        <Link to={`/staff/${member.id}/edit`}>
                          <Button variant="outline" size="xs">
                            تعديل
                          </Button>
                        </Link>

                        <Can permission={PERMISSIONS.ACCOUNT_DELETE}>
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() =>
                              handleDeleteStaff(member.id, member.fullName)
                            }
                            disabled={deleteMutation.isPending}
                          >
                            حذف
                          </Button>
                        </Can>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
