"use client"

import { use } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { getProducts } from "@/lib/dummy-data"
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
  { key: "brand", header: "Brand", render: (p) => p.brandName },
  { key: "cost", header: "Cost Price", render: (p) => `$${p.cost}` },
  { key: "price", header: "Selling Price", render: (p) => `$${p.price}` },
  { key: "margin", header: "Margin", render: (p) => `${(((p.price - p.cost) / p.price) * 100).toFixed(1)}%` },
  { key: "qty", header: "Qty", render: (p) => p.quantity },
  { key: "value", header: "Stock Value", render: (p) => `$${(p.quantity * p.cost).toLocaleString()}` },
]

export default function ProductReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const products = getProducts()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Product Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Product Report" }]} />
      <DataTable columns={columns} data={products} rowKey={(p) => p.id} selectable={false} searchPlaceholder="Search products..." getSearchValue={(p) => `${p.name} ${p.sku} ${p.brandName}`} />
    </div>
  )
}
