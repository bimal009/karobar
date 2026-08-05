"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import type { Meta } from "@/lib/common/pagination"
import { useLowStockProducts } from "../client/useProduct"
import type { ProductWithRelations } from "../api/product.action"

const columns: DataTableColumn<ProductWithRelations>[] = [
  { key: "sku", header: "SKU", render: (p) => p.sku },
  {
    key: "name",
    header: "Product Name",
    sortKey: "name",
    render: (p) => <span className="font-medium">{p.name}</span>,
  },
  { key: "category", header: "Category", render: (p) => p.category?.name ?? "—" },
  { key: "threshold", header: "Threshold", sortKey: "threshold", render: (p) => p.lowStockThreshold },
  {
    key: "qty",
    header: "Available Qty",
    sortKey: "quantity",
    render: (p) => <span className="font-medium text-destructive">{p.quantity}</span>,
  },
]

interface LowStockProductsViewProps {
  tenant: string
  initialData: { rows: ProductWithRelations[]; meta: Meta }
}

export function LowStockProductsView({ tenant, initialData }: LowStockProductsViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useLowStockProducts(
    tenant,
    { search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const products = data?.rows ?? []
  const total = data?.meta.total ?? 0
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Low Stocks"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Low Stocks" }]}
        actions={
          <Button render={<Link href={`/${tenant}/stock/adjustment`} />}>
            <Package /> Adjust Stock
          </Button>
        }
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
