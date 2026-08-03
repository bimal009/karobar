"use client"

import { use } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { getExpiredProducts } from "@/lib/dummy-data"
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
  { key: "qty", header: "Qty", render: (p) => p.quantity },
  { key: "expiry", header: "Expiry Date", render: (p) => <span className="font-medium text-destructive">{p.expiryDate}</span> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: () => (
      <div className="flex justify-end">
        <Button size="icon-sm" variant="ghost" aria-label="Remove"><Trash2 className="text-destructive" /></Button>
      </div>
    ),
  },
]

export default function ExpiredProductsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const products = getExpiredProducts()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expired Products"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Expired Products" }]}
      />
      <DataTable columns={columns} data={products} rowKey={(p) => p.id} searchPlaceholder="Search products..." getSearchValue={(p) => `${p.name} ${p.sku}`} />
    </div>
  )
}
