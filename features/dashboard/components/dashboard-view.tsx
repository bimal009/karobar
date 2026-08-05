"use client"

import Link from "next/link"
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Receipt,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { SalesPurchaseChart } from "@/components/tenant/sales-purchase-chart"
import { MiniDonutChart } from "@/components/tenant/mini-donut-chart"
import { useShell } from "@/components/layout/shell-context"
import { useDashboard } from "../client/useDashboard"
import type {
  DashboardData,
  DashboardLowStockProduct,
  DashboardRecentSale,
  DashboardTopCustomer,
  DashboardTopProduct,
} from "../api/dashboard.action"

interface DashboardViewProps {
  tenant: string
  initialData: DashboardData
}

const categoryColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-5)"]

export function DashboardView({ tenant, initialData }: DashboardViewProps) {
  const { userName } = useShell()
  const { data } = useDashboard(tenant, initialData)
  const {
    ordersCount,
    customersCount,
    suppliersCount,
    lowStock,
    topProducts,
    categories,
    revenueByDay,
    totalSales,
    totalSalesReturn,
    totalPurchase,
    totalPurchaseReturn,
    profit,
    invoiceDue,
    recentSales,
    topCustomers,
  } = data

  const base = `/${tenant}`

  const categoryChartData = categories.map((c, i) => ({
    name: c.name,
    value: c.productsCount,
    fill: categoryColors[i % categoryColors.length],
  }))
  const categoryConfig = Object.fromEntries(
    categories.map((c, i) => [c.name, { label: c.name, color: categoryColors[i % categoryColors.length] }])
  )

  const topProductsColumns: DataTableColumn<DashboardTopProduct>[] = [
    { key: "name", header: "Product", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "sold", header: "Sales", render: (p) => `${p.sold} sold` },
    { key: "revenue", header: "Revenue", render: (p) => `$${p.revenue.toLocaleString()}` },
  ]

  const lowStockColumns: DataTableColumn<DashboardLowStockProduct>[] = [
    { key: "name", header: "Product", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "sku", header: "SKU", render: (p) => p.sku },
    {
      key: "qty",
      header: "Qty Left",
      render: (p) => <span className="font-medium text-destructive">{p.quantity}</span>,
    },
  ]

  const recentSalesColumns: DataTableColumn<DashboardRecentSale>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {o.customerAvatarInitial}
          </div>
          <div>
            <p className="text-sm font-medium">{o.customerName}</p>
            <p className="text-xs text-muted-foreground">{o.orderNo}</p>
          </div>
        </div>
      ),
    },
    { key: "total", header: "Amount", render: (o) => `$${o.total.toFixed(2)}` },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
  ]

  const topCustomersColumns: DataTableColumn<DashboardTopCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {c.avatarInitial}
          </div>
          <span className="text-sm font-medium">{c.name}</span>
        </div>
      ),
    },
    { key: "location", header: "Location", render: (c) => c.location ?? "—" },
    { key: "orders", header: "Orders", render: (c) => c.totalOrders },
    { key: "spent", header: "Spent", render: (c) => `$${c.totalSpent.toLocaleString()}` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Welcome, ${userName}`} crumbs={[{ label: `You have ${ordersCount} Orders, Total` }]} />

      {lowStock.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/10 ring-0">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Your product <strong>{lowStock[0].name}</strong> is running low, already below{" "}
              {lowStock[0].lowStockThreshold} pcs.{" "}
              <Link href={`${base}/products/low-stocks`} className="font-medium underline">
                View Low Stocks
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Sales" value={`$${totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={ShoppingCart} tone="primary" />
        <StatCard label="Total Sales Return" value={`$${totalSalesReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={RotateCcw} tone="dark" />
        <StatCard label="Total Purchase" value={`$${totalPurchase.toLocaleString()}`} icon={ShoppingBag} tone="teal" />
        <StatCard label="Total Purchase Return" value={`$${totalPurchaseReturn.toLocaleString()}`} icon={ArrowDownLeft} tone="blue" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Profit" value={`$${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Wallet} />
        <StatCard label="Invoice Due" value={`$${invoiceDue.toLocaleString()}`} icon={Receipt} />
        <StatCard label="Total Expenses" value={`$${totalPurchase.toLocaleString()}`} icon={Package} />
        <StatCard label="Total Payment Returns" value={`$${(totalSalesReturn + totalPurchaseReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={ArrowUpRight} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sales &amp; Purchase</h3>
              <span className="text-xs text-muted-foreground">Revenue by day</span>
            </div>
            <SalesPurchaseChart data={revenueByDay} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h3 className="font-semibold">Overall Information</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border p-3">
                <Users className="mx-auto size-4 text-primary" />
                <p className="mt-1 text-sm font-bold">{suppliersCount}</p>
                <p className="text-[11px] text-muted-foreground">Suppliers</p>
              </div>
              <div className="rounded-lg border p-3">
                <Users className="mx-auto size-4 text-primary" />
                <p className="mt-1 text-sm font-bold">{customersCount}</p>
                <p className="text-[11px] text-muted-foreground">Customers</p>
              </div>
              <div className="rounded-lg border p-3">
                <ShoppingCart className="mx-auto size-4 text-primary" />
                <p className="mt-1 text-sm font-bold">{ordersCount}</p>
                <p className="text-[11px] text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Top Selling Products</h3>
          <Link href={`${base}/products`} className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <DataTable
          columns={topProductsColumns}
          data={topProducts}
          total={topProducts.length}
          rowKey={(p) => p.id}
          selectable={false}
          hideSearch
          hidePagination
          paramPrefix="top-products-"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Low Stock Products</h3>
          <Link href={`${base}/products/low-stocks`} className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <DataTable
          columns={lowStockColumns}
          data={lowStock}
          total={lowStock.length}
          rowKey={(p) => p.id}
          selectable={false}
          hideSearch
          hidePagination
          paramPrefix="low-stock-"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Sales</h3>
          <Link href={`${base}/reports/sales`} className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <DataTable
          columns={recentSalesColumns}
          data={recentSales}
          total={recentSales.length}
          rowKey={(o) => o.id}
          selectable={false}
          hideSearch
          hidePagination
          paramPrefix="recent-sales-"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">Top Customers</h3>
        <DataTable
          columns={topCustomersColumns}
          data={topCustomers}
          total={topCustomers.length}
          rowKey={(c) => c.id}
          selectable={false}
          hideSearch
          hidePagination
          paramPrefix="top-customers-"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="w-full sm:w-auto">
            <h3 className="font-semibold">Top Categories</h3>
            <MiniDonutChart data={categoryChartData} config={categoryConfig} />
          </div>
          <div className="flex w-full flex-col gap-3">
            {categories.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                  {c.name}
                </span>
                <span className="font-medium">{c.percent}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
