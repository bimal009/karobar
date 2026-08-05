"use client"

import { Banknote, DollarSign, RefreshCw, ShoppingBag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { SalesAnalyticsChart } from "@/components/tenant/sales-analytics-chart"
import { useShell } from "@/components/layout/shell-context"
import { formatCurrency } from "@/lib/common/currency"
import { useSalesDashboard } from "../client/useDashboard"
import type { DashboardRecentSale, DashboardTopProduct, SalesDashboardData } from "../api/dashboard.action"

interface SalesDashboardViewProps {
  tenant: string
  initialData: SalesDashboardData
}

export function SalesDashboardView({ tenant, initialData }: SalesDashboardViewProps) {
  const { currency } = useShell()
  const { data } = useSalesDashboard(tenant, initialData)
  const {
    userName,
    topProducts,
    weeklyEarning,
    totalSales,
    totalRevenue,
    purchasedGoods,
    salesByStore,
    maxStoreTotal,
    recent,
    revenueByDay,
  } = data

  const bestSellerColumns: DataTableColumn<DashboardTopProduct>[] = [
    { key: "name", header: "Product", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "avgPrice", header: "Avg. Price", render: (p) => formatCurrency(p.avgPrice, currency, { maximumFractionDigits: 0 }) },
    { key: "sold", header: "Sales", render: (p) => p.sold },
  ]

  const recentTransactionsColumns: DataTableColumn<DashboardRecentSale>[] = [
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
            <p className="text-xs text-muted-foreground capitalize">{o.paymentMethod}</p>
          </div>
        </div>
      ),
    },
    { key: "total", header: "Amount", render: (o) => formatCurrency(o.total, currency) },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Hi ${userName.split(" ")[0]}, here's what's happening with your store today.`}
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Sales Dashboard" }]}
        actions={
          <Button variant="outline" size="icon" aria-label="Refresh">
            <RefreshCw />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Weekly Earning" value={formatCurrency(weeklyEarning, currency)} icon={TrendingUp} tone="primary" />
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue, currency, { maximumFractionDigits: 0 })} icon={DollarSign} tone="dark" />
        <StatCard label="No. of Total Sales" value={totalSales.toLocaleString()} icon={TrendingUp} tone="teal" />
        <StatCard label="No. of Purchased Goods" value={purchasedGoods.toLocaleString()} icon={ShoppingBag} tone="blue" />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">Best Seller</h3>
        <DataTable
          columns={bestSellerColumns}
          data={topProducts}
          total={topProducts.length}
          rowKey={(p) => p.id}
          hideSearch
          hidePagination
          paramPrefix="best-seller-"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">Recent Transactions</h3>
        <DataTable
          columns={recentTransactionsColumns}
          data={recent}
          total={recent.length}
          rowKey={(o) => o.id}
          hideSearch
          hidePagination
          paramPrefix="recent-tx-"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="font-semibold">Sales Analytics</h3>
            <SalesAnalyticsChart data={revenueByDay} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sales by Branch</h3>
              <Banknote className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-3">
              {salesByStore.length === 0 && <p className="text-sm text-muted-foreground">No branch sales yet.</p>}
              {salesByStore.map((s) => (
                <div key={s.store} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{s.store}</span>
                    <span className="font-medium">{formatCurrency(s.total, currency, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(s.total / maxStoreTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
