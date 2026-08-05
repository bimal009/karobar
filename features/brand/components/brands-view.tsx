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
import { BrandFormSheet } from "./brand-form-sheet"
import { useBrands, useDeleteBrand } from "../client/useBrand"
import type { BrandWithProductCount } from "../api/brand.action"

interface BrandsViewProps {
  tenant: string
  initialData: { rows: BrandWithProductCount[]; meta: Meta }
}

export function BrandsView({ tenant, initialData }: BrandsViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useBrands(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const brands = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand(tenant)

  async function handleDelete(id: string) {
    const result = await deleteBrand(id)
    if (!result.error) {
      toast.add({ title: "Brand deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete brand", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<BrandWithProductCount>[] = [
    {
      key: "name",
      header: "Brand",
      sortKey: "name",
      render: (b) => <span className="font-medium">{b.name}</span>,
    },
    { key: "products", header: "Products", render: (b) => b.productsCount },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-1">
          <BrandFormSheet
            tenant={tenant}
            brand={b}
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
            title={`Delete "${b.name}"?`}
            description="This will permanently remove the brand. Brands with products cannot be deleted."
            isPending={isDeleting}
            onConfirm={() => handleDelete(b.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Brands"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Brands" }]}
        actions={
          <BrandFormSheet
            tenant={tenant}
            trigger={
              <Button>
                <Plus /> Add Brand
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={brands}
        total={total}
        isLoading={isFetching}
        rowKey={(b) => b.id}
        searchPlaceholder="Search brands..."
      />
    </div>
  )
}
