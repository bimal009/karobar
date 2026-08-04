"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { useLowStockProducts } from "../client/useProduct"
import type { ProductWithRelations } from "../api/product.action"

const columns: DataTableColumn<ProductWithRelations>[] = [
  { key: "sku", header: "SKU", render: (p) => p.sku },
  {
    key: "name",
    header: "Product Name",
    render: (p) => <span className="font-medium">{p.name}</span>,
  },
  { key: "category", header: "Category", render: (p) => p.categoryName },
  { key: "threshold", header: "Threshold", render: (p) => p.lowStockThreshold },
  { key: "qty", header: "Available Qty", render: (p) => <span className="font-medium text-destructive">{p.quantity}</span> },
]

interface LowStockProductsViewProps {
  tenant: string
  initialData: ProductWithRelations[]
}

export function LowStockProductsView({ tenant, initialData }: LowStockProductsViewProps) {
  const { data: products } = useLowStockProducts(tenant, initialData)
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
      <DataTable columns={columns} data={products} rowKey={(p) => p.id} searchPlaceholder="Search products..." getSearchValue={(p) => `${p.name} ${p.sku}`} />
    </div>
  )
}
