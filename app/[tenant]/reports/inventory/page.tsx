"use client"

import { use } from "react"
import { AlertTriangle, Boxes, Package, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
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
  { key: "category", header: "Category", render: (p) => p.categoryName },
  { key: "qty", header: "Qty", render: (p) => p.quantity },
  { key: "value", header: "Stock Value", render: (p) => `$${(p.quantity * p.cost).toLocaleString()}` },
  {
    key: "status",
    header: "Stock Status",
    render: (p) => (
      <StatusBadge status={p.quantity === 0 ? "cancelled" : p.quantity <= p.lowStockThreshold ? "pending" : "active"} />
    ),
  },
]

export default function InventoryReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const products = getProducts()
  const outOfStock = products.filter((p) => p.quantity === 0).length
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length
  const stockValue = products.reduce((s, p) => s + p.quantity * p.cost, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Inventory Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Package className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Products</p><p className="text-xl font-bold">{products.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Boxes className="size-5" /></div><div><p className="text-xs text-muted-foreground">Stock Value</p><p className="text-xl font-bold">${stockValue.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><AlertTriangle className="size-5" /></div><div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-xl font-bold">{lowStock}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><XCircle className="size-5" /></div><div><p className="text-xs text-muted-foreground">Out of Stock</p><p className="text-xl font-bold">{outOfStock}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={products} rowKey={(p) => p.id} selectable={false} searchPlaceholder="Search products..." getSearchValue={(p) => `${p.name} ${p.sku}`} />
    </div>
  )
}
