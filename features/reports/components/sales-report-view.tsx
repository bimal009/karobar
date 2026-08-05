"use client"

import * as React from "react"
import { parseAsIsoDate, useQueryStates } from "nuqs"
import { Download, FileSpreadsheet, Printer, ShoppingBag, Users, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Card, CardContent } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { useShell } from "@/components/layout/shell-context"
import { formatCurrency } from "@/lib/common/currency"
import { useSalesReport } from "../client/useReports"
import type { SalesReportData, SalesReportRow } from "../api/reports.action"

interface SalesReportViewProps {
  tenant: string
  initialData: SalesReportData
}

const currentYear = new Date().getFullYear()

export function SalesReportView({ tenant, initialData }: SalesReportViewProps) {
  const { currency } = useShell()
  const [{ from, to }, setDateRange] = useQueryStates({
    from: parseAsIsoDate.withDefault(new Date(currentYear, 0, 1)),
    to: parseAsIsoDate.withDefault(new Date(currentYear, 11, 31)),
  })
  const { data } = useSalesReport(tenant, initialData)
  const { rows, newSales, unitsSold, ordersCount, customersCount, productOptions } = data
  const [{ q }] = useDataTableParams()
  const filteredRows = React.useMemo(
    () =>
      q
        ? rows.filter((r) => `${r.name} ${r.sku} ${r.brand} ${r.category}`.toLowerCase().includes(q.toLowerCase()))
        : rows,
    [rows, q]
  )

  const columns: DataTableColumn<SalesReportRow>[] = [
    { key: "sku", header: "SKU", render: (r) => r.sku },
    {
      key: "name",
      header: "Product Name",
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "brand", header: "Brand", render: (r) => r.brand },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "soldQty", header: "Sold Qty", render: (r) => String(r.soldQty).padStart(2, "0") },
    { key: "soldAmount", header: "Sold Amount", render: (r) => formatCurrency(r.soldAmount, currency) },
    { key: "inStock", header: "Instock Qty", render: (r) => r.inStock },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sales Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Sales Report" }]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">New Sales</p>
              <p className="text-xl font-bold">{formatCurrency(newSales, currency, { maximumFractionDigits: 0 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold">{ordersCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Customers</p>
              <p className="text-xl font-bold">{customersCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Units Sold</p>
              <p className="text-xl font-bold">{unitsSold}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium">Choose Date</label>
            <DateRangePicker
              value={{ from, to }}
              onChange={(range) => setDateRange({ from: range?.from ?? null, to: range?.to ?? null })}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium">Store</label>
            <Select
              items={[
                { value: "all", label: "All" },
                { value: "downtown", label: "Downtown Store" },
                { value: "mall", label: "Mall Outlet" },
              ]}
              defaultValue="all"
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="downtown">Downtown Store</SelectItem>
                <SelectItem value="mall">Mall Outlet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium">Products</label>
            <Select
              items={[{ value: "all", label: "All" }, ...productOptions.map((p) => ({ value: p.id, label: p.name }))]}
              defaultValue="all"
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {productOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="sm:w-auto">Generate Report</Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Sales Report</h3>
        <div className="flex gap-1.5">
          <IconButton label="Export PDF" variant="outline" size="icon">
            <Download />
          </IconButton>
          <IconButton label="Export Excel" variant="outline" size="icon">
            <FileSpreadsheet />
          </IconButton>
          <IconButton label="Print" variant="outline" size="icon">
            <Printer />
          </IconButton>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredRows}
        total={filteredRows.length}
        rowKey={(r) => r.id}
        searchPlaceholder="Search products..."
      />
    </div>
  )
}
