"use client"

import { AlertTriangle, Boxes, Package, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useInventoryReport } from "../client/useReports"
import type { InventoryProductRow, InventoryReportData } from "../api/reports.action"

const columns: DataTableColumn<InventoryProductRow>[] = [
  { key: "sku", header: "SKU", render: (p) => p.sku },
  {
    key: "name",
    header: "Product Name",
    render: (p) => <span className="font-medium">{p.name}</span>,
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

interface InventoryReportViewProps {
  tenant: string
  initialData: InventoryReportData
}

export function InventoryReportView({ tenant, initialData }: InventoryReportViewProps) {
  const { data } = useInventoryReport(tenant, initialData)
  const { products, outOfStock, lowStock, stockValue } = data

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
