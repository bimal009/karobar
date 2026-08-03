"use client"

import { use } from "react"
import { Download, FileSpreadsheet, Printer, ShoppingBag, Users, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { CategoryIcon } from "@/components/shared/entity-icon"
import { getCustomers, getOrders, getProducts } from "@/lib/dummy-data"

interface ReportRow {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  soldQty: number
  soldAmount: number
  inStock: number
}

export default function SalesReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const products = getProducts()
  const orders = getOrders()
  const customers = getCustomers()

  const soldMap = new Map<string, { qty: number; amount: number }>()
  for (const order of orders) {
    for (const item of order.items) {
      const entry = soldMap.get(item.productId) ?? { qty: 0, amount: 0 }
      entry.qty += item.quantity
      entry.amount += item.quantity * item.price
      soldMap.set(item.productId, entry)
    }
  }

  const rows: ReportRow[] = products.map((p) => {
    const sold = soldMap.get(p.id) ?? { qty: 0, amount: 0 }
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brandName,
      category: p.categoryName,
      soldQty: sold.qty,
      soldAmount: sold.amount,
      inStock: p.quantity,
    }
  })

  const newSales = rows.reduce((sum, r) => sum + r.soldAmount, 0)
  const unitsSold = rows.reduce((sum, r) => sum + r.soldQty, 0)

  const columns: DataTableColumn<ReportRow>[] = [
    { key: "sku", header: "SKU", render: (r) => r.sku },
    {
      key: "name",
      header: "Product Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <CategoryIcon categoryName={r.category} />
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "brand", header: "Brand", render: (r) => r.brand },
    { key: "category", header: "Category", render: (r) => r.category },
    { key: "soldQty", header: "Sold Qty", render: (r) => String(r.soldQty).padStart(2, "0") },
    { key: "soldAmount", header: "Sold Amount", render: (r) => `$${r.soldAmount.toFixed(2)}` },
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
              <p className="text-xl font-bold">${newSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
              <p className="text-xl font-bold">{orders.length}</p>
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
              <p className="text-xl font-bold">{customers.length}</p>
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
            <Input type="text" defaultValue="01-Jan-2026 - 31-Dec-2026" readOnly />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium">Store</label>
            <Select defaultValue="all">
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
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {products.slice(0, 5).map((p) => (
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
        data={rows}
        rowKey={(r) => r.id}
        searchPlaceholder="Search products..."
        getSearchValue={(r) => `${r.name} ${r.sku} ${r.brand} ${r.category}`}
        selectable={false}
      />
    </div>
  )
}
