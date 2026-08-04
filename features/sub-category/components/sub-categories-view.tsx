"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Category } from "@/lib/database/schemas"
import { SubCategoryFormSheet } from "./sub-category-form-sheet"
import { useDeleteSubCategory, useSubCategories } from "../client/useSubCategory"
import type { SubCategoryWithCategory } from "../api/sub-category.action"

interface SubCategoriesViewProps {
  tenant: string
  initialData: SubCategoryWithCategory[]
  categories: Category[]
}

export function SubCategoriesView({ tenant, initialData, categories }: SubCategoriesViewProps) {
  const { data: subCategories } = useSubCategories(tenant, initialData)
  const { mutateAsync: deleteSubCategory, isPending: isDeleting } = useDeleteSubCategory(tenant)

  async function handleDelete(id: string) {
    const result = await deleteSubCategory(id)
    if (!result.error) {
      toast.add({ title: "Sub category deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete sub category", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<SubCategoryWithCategory>[] = [
    { key: "name", header: "Sub Category", render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "category", header: "Category", render: (s) => s.categoryName },
    { key: "products", header: "Products", render: (s) => s.productsCount },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <SubCategoryFormSheet
            tenant={tenant}
            categories={categories}
            subCategory={s}
            trigger={
              <IconButton label="Edit" size="icon-sm" variant="ghost">
                <Pencil />
              </IconButton>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <IconButton label="Delete" size="icon-sm" variant="ghost">
                <Trash2 className="text-destructive" />
              </IconButton>
            }
            title={`Delete "${s.name}"?`}
            description="This will permanently remove the sub category. Sub categories with products cannot be deleted."
            isPending={isDeleting}
            onConfirm={() => handleDelete(s.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sub Categories"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Sub Categories" }]}
        actions={
          <SubCategoryFormSheet
            tenant={tenant}
            categories={categories}
            trigger={
              <Button>
                <Plus /> Add Sub Category
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={subCategories}
        rowKey={(s) => s.id}
        searchPlaceholder="Search sub categories..."
        getSearchValue={(s) => `${s.name} ${s.categoryName}`}
      />
    </div>
  )
}
