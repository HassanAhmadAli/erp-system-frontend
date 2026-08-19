import { Link } from "react-router-dom"
import { FolderOpen, Plus } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"

import { CategoriesTable } from "@/view/components/categories/CategoriesTable"
import { Button } from "@/view/components/ui/button"

export function CategoriesPage() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              {t("pages:categories.title")}
            </h1>

            <FolderOpen className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:categories.subtitle")}
          </p>
        </div>

        <Can permission={PERMISSIONS.CATEGORY_MANAGE}>
          <Link to="/categories/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              {t("pages:categories.create")}
            </Button>
          </Link>
        </Can>
      </header>

      <CategoriesTable />
    </div>
  )
}
