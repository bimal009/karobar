import Link from "next/link"
import { Building2, DollarSign, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { TenantGrowthChart } from "@/components/superadmin/tenant-growth-chart"
import { MrrChart } from "@/components/superadmin/mrr-chart"
import { PlanDistributionChart } from "@/components/superadmin/plan-distribution-chart"
import { tenants } from "@/lib/dummy-data"

export default function SuperAdminDashboardPage() {
  const totalTenants = tenants.length
  const activeTenants = tenants.filter((t) => t.status === "active").length
  const totalUsers = tenants.reduce((sum, t) => sum + t.usersCount, 0)
  const totalMrr = tenants.reduce((sum, t) => sum + t.mrr, 0)

  const recentlyRegistered = [...tenants].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5)
  const trialsEnding = tenants.filter((t) => t.status === "trial" || t.status === "suspended")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Welcome, Admin" crumbs={[{ label: "You have 6 tenants across the platform today" }]} />

      <Card className="overflow-hidden bg-primary text-primary-foreground ring-0">
        <CardContent className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Welcome back, Adrian!</h2>
            <p className="mt-1 text-primary-foreground/80">
              {tenants.filter((t) => t.status === "trial").length} new tenant is on trial right now.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" render={<Link href="/superadmin/tenants" />}>
              Tenants
            </Button>
            <Button
              variant="outline"
              render={<Link href="/superadmin/billing" />}
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              All Plans
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tenants" value={String(totalTenants)} icon={Building2} delta={{ value: "+19.0%", positive: true }} />
        <StatCard label="Active Tenants" value={String(activeTenants)} icon={TrendingUp} delta={{ value: "-12%", positive: false }} />
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon={Users} delta={{ value: "+6%", positive: true }} />
        <StatCard label="Total MRR" value={`$${totalMrr.toLocaleString()}`} icon={DollarSign} delta={{ value: "-16%", positive: false }} tone="primary" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-3">
          <CardContent>
            <h3 className="font-semibold">New Tenants</h3>
            <p className="text-xs text-muted-foreground">This week</p>
            <TenantGrowthChart />
          </CardContent>
        </Card>
        <Card className="xl:col-span-6">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">MRR</h3>
                <p className="text-xs text-emerald-600">+40% increased from last year</p>
              </div>
              <span className="text-xl font-bold">${totalMrr.toLocaleString()}</span>
            </div>
            <MrrChart />
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardContent>
            <h3 className="font-semibold">Plan Distribution</h3>
            <p className="mb-2 text-xs text-muted-foreground">This month</p>
            <PlanDistributionChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recently Registered</h3>
              <Link href="/superadmin/tenants" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {recentlyRegistered.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ${tenant.logoColor}`}>
                      {tenant.logoInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{tenant.plan} plan</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{tenant.usersCount} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tenant Status</h3>
              <Link href="/superadmin/tenants" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ${tenant.logoColor}`}>
                      {tenant.logoInitial}
                    </div>
                    <p className="text-sm font-medium">{tenant.name}</p>
                  </div>
                  <StatusBadge status={tenant.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Needs Attention</h3>
              <Link href="/superadmin/tenants" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {trialsEnding.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ${tenant.logoColor}`}>
                      {tenant.logoInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tenant.status === "trial" ? `Trial ends ${tenant.trialEndsAt}` : "Subscription suspended"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Send Reminder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
