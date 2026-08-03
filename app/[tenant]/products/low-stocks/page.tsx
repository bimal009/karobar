"use client"

import { use } from "react"
import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { getLowStockProducts } from "@/lib/dummy-data"
import type { Product } from "@/lib/types"

const columns: DataTableColumn<Product>[] = [
  { key: "sku", header: "SKU", render: (p) => p.sku },
  {
    key: "name",
    header: "Product Name",
    render: (p) => (
      <div className="flex items-center gap-3">
        <CategoryIcon categoryName={p.categoryName} />
        <span className="font-medium">{p.name}</span>
      </div>
    ),
  },
  { key: "category", header: "Category", render: (p) => p.categoryName },
  { key: "threshold", header: "Threshold", render: (p) => p.lowStockThreshold },
  { key: "qty", header: "Available Qty", render: (p) => <span className="font-medium text-destructive">{p.quantity}</span> },
]

export default function LowStocksPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const products = getLowStockProducts()
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
