"use client"

import * as React from "react"
import { DollarSign, Package, Percent, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { useProductReport } from "../client/useReports"
import type { ProductReportData, ProductReportRow } from "../api/reports.action"

const columns: DataTableColumn<ProductReportRow>[] = [
  { key: "sku", header: "SKU", render: (p) => p.sku },
  {
    key: "name",
    header: "Product Name",
    render: (p) => <span className="font-medium">{p.name}</span>,
  },
  { key: "brand", header: "Brand", render: (p) => p.brandName },
  { key: "cost", header: "Cost Price", render: (p) => `$${p.cost}` },
  { key: "price", header: "Selling Price", render: (p) => `$${p.price}` },
  { key: "margin", header: "Margin", render: (p) => `${p.margin.toFixed(1)}%` },
  { key: "qty", header: "Qty", render: (p) => p.quantity },
  { key: "unitsSold", header: "Units Sold", render: (p) => p.unitsSold },
  { key: "revenue", header: "Revenue", render: (p) => `$${p.revenue.toLocaleString()}` },
]

interface ProductReportViewProps {
  tenant: string
  initialData: ProductReportData
}

export function ProductReportView({ tenant, initialData }: ProductReportViewProps) {
  const { data } = useProductReport(tenant, initialData)
  const { rows, totalProducts, totalRevenue, totalUnitsSold, avgMargin } = data
  const [{ q }] = useDataTableParams()
  const filteredRows = React.useMemo(
    () =>
      q
        ? rows.filter((p) => `${p.name} ${p.sku} ${p.brandName}`.toLowerCase().includes(q.toLowerCase()))
        : rows,
    [rows, q]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Product Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Product Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Package className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Products</p><p className="text-xl font-bold">{totalProducts}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-5" /></div><div><p className="text-xs text-muted-foreground">Units Sold</p><p className="text-xl font-bold">{totalUnitsSold}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Percent className="size-5" /></div><div><p className="text-xs text-muted-foreground">Avg. Margin</p><p className="text-xl font-bold">{avgMargin.toFixed(1)}%</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={filteredRows} total={filteredRows.length} rowKey={(p) => p.id} selectable={false} searchPlaceholder="Search products..." />
    </div>
  )
}
