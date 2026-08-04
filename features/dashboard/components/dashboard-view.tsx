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
import { CategoryIcon } from "@/components/shared/entity-icon"
import { SalesPurchaseChart } from "@/components/tenant/sales-purchase-chart"
import { MiniDonutChart } from "@/components/tenant/mini-donut-chart"
import { useDashboard } from "../client/useDashboard"
import type { DashboardData } from "../api/dashboard.action"

interface DashboardViewProps {
  tenant: string
  initialData: DashboardData
}

const categoryColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-5)"]

export function DashboardView({ tenant, initialData }: DashboardViewProps) {
  const { data } = useDashboard(tenant, initialData)
  const {
    ordersCount,
    customersCount,
    suppliersCount,
    lowStock,
    topProducts,
    categories,
    totalCategoryProducts,
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Welcome, Admin" crumbs={[{ label: `You have ${ordersCount} Orders, Total` }]} />

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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Top Selling Products</h3>
              <Link href={`${base}/products`} className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {topProducts.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoryName={p.categoryName} />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sold} sales</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">${p.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Low Stock Products</h3>
              <Link href={`${base}/products/low-stocks`} className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {lowStock.length === 0 && <p className="text-sm text-muted-foreground">No low stock products.</p>}
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoryName={p.categoryName} />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-destructive">{p.quantity} left</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Sales</h3>
              <Link href={`${base}/reports/sales`} className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {recentSales.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
              {recentSales.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {o.customerAvatarInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.orderNo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${o.total.toFixed(2)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="font-semibold">Top Customers</h3>
            <div className="mt-4 flex flex-col gap-4">
              {topCustomers.length === 0 && <p className="text-sm text-muted-foreground">No customers with orders yet.</p>}
              {topCustomers.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {c.avatarInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.location ?? "—"} · {c.totalOrders} orders
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">${c.totalSpent.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  <span className="font-medium">
                    {totalCategoryProducts > 0 ? Math.round((c.productsCount / totalCategoryProducts) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
