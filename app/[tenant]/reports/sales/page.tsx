import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { SalesReportView } from "@/features/reports/components/sales-report-view"
import { getSalesReportData } from "@/features/reports/api/reports.action"

export default async function SalesReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSalesReportData(tenant)

  return (
    <PageShell pageName="Sales Report">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load sales report</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <SalesReportView
          tenant={tenant}
          initialData={
            result.data ?? {
              rows: [],
              newSales: 0,
              unitsSold: 0,
              ordersCount: 0,
              customersCount: 0,
              productOptions: [],
            }
          }
        />
      )}
    </PageShell>
  )
}
