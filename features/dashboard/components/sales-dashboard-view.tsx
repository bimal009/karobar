"use client"

import { Banknote, RefreshCw, ShoppingBag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { SalesAnalyticsChart } from "@/components/tenant/sales-analytics-chart"
import { useSalesDashboard } from "../client/useDashboard"
import type { SalesDashboardData } from "../api/dashboard.action"

interface SalesDashboardViewProps {
  tenant: string
  initialData: SalesDashboardData
}

export function SalesDashboardView({ tenant, initialData }: SalesDashboardViewProps) {
  const { data } = useSalesDashboard(tenant, initialData)
  const { userName, topProducts, weeklyEarning, totalSales, purchasedGoods, salesByStore, maxStoreTotal, recent, revenueByDay } = data

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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm font-medium text-primary">Weekly Earning</p>
            <p className="text-3xl font-bold">${weeklyEarning.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="size-3.5" /> Completed sales in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground ring-0">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{totalSales.toLocaleString()}</p>
              <p className="text-sm text-primary-foreground/80">No of Total Sales</p>
            </div>
            <TrendingUp className="size-6 text-primary-foreground/70" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 text-white ring-0 dark:bg-zinc-950">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{purchasedGoods.toLocaleString()}</p>
              <p className="text-sm text-white/70">No of Purchased Goods</p>
            </div>
            <ShoppingBag className="size-6 text-white/70" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Best Seller</h3>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {topProducts.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">${(p.revenue / p.sold).toFixed(0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Sales</p>
                    <p className="text-sm font-semibold">{p.sold}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Transactions</h3>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {recent.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
              {recent.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {o.customerAvatarInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{o.paymentMethod}</p>
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
                    <span className="font-medium">${s.total.toFixed(0)}</span>
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
