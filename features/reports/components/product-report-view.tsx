"use client"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { useProductReport } from "../client/useReports"
import type { ProductReportRow } from "../api/reports.action"

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
  { key: "margin", header: "Margin", render: (p) => `${(((p.price - p.cost) / (p.price || 1)) * 100).toFixed(1)}%` },
  { key: "qty", header: "Qty", render: (p) => p.quantity },
  { key: "unitsSold", header: "Units Sold", render: (p) => p.unitsSold },
  { key: "revenue", header: "Revenue", render: (p) => `$${p.revenue.toLocaleString()}` },
]

interface ProductReportViewProps {
  tenant: string
  initialData: ProductReportRow[]
}

export function ProductReportView({ tenant, initialData }: ProductReportViewProps) {
  const { data: products } = useProductReport(tenant, initialData)
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Product Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Product Report" }]} />
      <DataTable columns={columns} data={products} rowKey={(p) => p.id} selectable={false} searchPlaceholder="Search products..." getSearchValue={(p) => `${p.name} ${p.sku} ${p.brandName}`} />
    </div>
  )
}
