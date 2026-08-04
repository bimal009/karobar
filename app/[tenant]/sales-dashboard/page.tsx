import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { SalesDashboardView } from "@/features/dashboard/components/sales-dashboard-view"
import { getSalesDashboardData } from "@/features/dashboard/api/dashboard.action"

export default async function SalesDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSalesDashboardData(tenant)

  return (
    <PageShell pageName="Sales Dashboard">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load sales dashboard</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <SalesDashboardView
          tenant={tenant}
          initialData={
            result.data ?? {
              userName: "",
              topProducts: [],
              weeklyEarning: 0,
              totalSales: 0,
              totalRevenue: 0,
              purchasedGoods: 0,
              salesByStore: [],
              maxStoreTotal: 1,
              recent: [],
              revenueByDay: [],
            }
          }
        />
      )}
    </PageShell>
  )
}
