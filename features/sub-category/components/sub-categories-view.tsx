"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Meta } from "@/lib/common/pagination"
import { SubCategoryFormSheet } from "./sub-category-form-sheet"
import { useDeleteSubCategory, useSubCategories } from "../client/useSubCategory"
import type { SubCategoryPageData, SubCategoryWithCategory } from "../api/sub-category.action"

interface SubCategoriesViewProps {
  tenant: string
  initialData: { rows: SubCategoryPageData; meta: Meta }
}

export function SubCategoriesView({ tenant, initialData }: SubCategoriesViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useSubCategories(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const subCategories = data?.rows.subCategories ?? []
  const categories = data?.rows.categories ?? []
  const total = data?.meta.total ?? 0
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
    {
      key: "name",
      header: "Sub Category",
      sortKey: "name",
      render: (s) => <span className="font-medium">{s.name}</span>,
    },
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
        total={total}
        isLoading={isFetching}
        rowKey={(s) => s.id}
        searchPlaceholder="Search sub categories..."
      />
    </div>
  )
}
