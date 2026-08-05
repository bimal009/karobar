"use client"

import { Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { IconButton } from "@/components/shared/icon-button"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@/components/ui/toast"
import type { Meta } from "@/lib/common/pagination"
import { useDeleteProduct, useExpiredProducts } from "../client/useProduct"
import type { ProductWithRelations } from "../api/product.action"

interface ExpiredProductsViewProps {
  tenant: string
  initialData: { rows: ProductWithRelations[]; meta: Meta }
}

export function ExpiredProductsView({ tenant, initialData }: ExpiredProductsViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useExpiredProducts(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const products = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct(tenant)

  async function handleDelete(id: string) {
    const result = await deleteProduct(id)
    if (!result.error) {
      toast.add({ title: "Product removed", type: "success" })
    } else {
      toast.add({ title: "Failed to remove product", description: result.message, type: "error" })
    }
    return !result.error
  }

  const columns: DataTableColumn<ProductWithRelations>[] = [
    { key: "sku", header: "SKU", render: (p) => p.sku },
    {
      key: "name",
      header: "Product Name",
      sortKey: "name",
      render: (p) => <span className="font-medium">{p.name}</span>,
    },
    { key: "category", header: "Category", render: (p) => p.category?.name ?? "—" },
    { key: "qty", header: "Qty", sortKey: "quantity", render: (p) => p.quantity },
    {
      key: "expiry",
      header: "Expiry Date",
      sortKey: "expiryDate",
      render: (p) => <span className="font-medium text-destructive">{p.expiryDate}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end">
          <ConfirmDeleteDialog
            trigger={
              <IconButton label="Remove" size="icon-sm" variant="ghost">
                <Trash2 className="text-destructive" />
              </IconButton>
            }
            title={`Remove "${p.name}"?`}
            description="This will permanently delete the product."
            isPending={isDeleting}
            onConfirm={() => handleDelete(p.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expired Products"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Expired Products" }]}
      />
      <DataTable
        columns={columns}
        data={products}
        total={total}
        isLoading={isFetching}
        rowKey={(p) => p.id}
        searchPlaceholder="Search products..."
      />
    </div>
  )
}
