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
import { CategoryFormSheet } from "./category-form-sheet"
import { useCategories, useDeleteCategory } from "../client/useCategory"
import type { CategoryWithProductCount } from "../api/category.action"

interface CategoriesViewProps {
  tenant: string
  initialData: { rows: CategoryWithProductCount[]; meta: Meta }
}

export function CategoriesView({ tenant, initialData }: CategoriesViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useCategories(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const categories = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory(tenant)

  async function handleDelete(id: string) {
    const result = await deleteCategory(id)
    if (!result.error) {
      toast.add({ title: "Category deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete category", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<CategoryWithProductCount>[] = [
    {
      key: "name",
      header: "Category",
      sortKey: "name",
      render: (c) => <span className="font-medium">{c.name}</span>,
    },
    { key: "slug", header: "Slug", render: (c) => <span className="text-muted-foreground">/{c.slug}</span> },
    { key: "products", header: "Products", render: (c) => c.productsCount },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <CategoryFormSheet
            tenant={tenant}
            category={c}
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
            title={`Delete "${c.name}"?`}
            description="This will permanently remove the category. Categories with products cannot be deleted."
            isPending={isDeleting}
            onConfirm={() => handleDelete(c.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Categories" }]}
        actions={
          <CategoryFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Category
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={categories}
        total={total}
        isLoading={isFetching}
        rowKey={(c) => c.id}
        searchPlaceholder="Search categories..."
      />
    </div>
  )
}
