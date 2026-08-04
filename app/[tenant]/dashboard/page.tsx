import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { DashboardView } from "@/features/dashboard/components/dashboard-view"
import { getDashboardData } from "@/features/dashboard/api/dashboard.action"

export default async function TenantDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getDashboardData(tenant)

  return (
    <PageShell pageName="Dashboard">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load dashboard</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <DashboardView
          tenant={tenant}
          initialData={
            result.data ?? {
              ordersCount: 0,
              customersCount: 0,
              suppliersCount: 0,
              lowStock: [],
              topProducts: [],
              categories: [],
              totalCategoryProducts: 0,
              revenueByDay: [],
              totalSales: 0,
              totalSalesReturn: 0,
              totalPurchase: 0,
              totalPurchaseReturn: 0,
              profit: 0,
              invoiceDue: 0,
              recentSales: [],
              topCustomers: [],
            }
          }
        />
      )}
    </PageShell>
  )
}
