import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { CustomerReportView } from "@/features/reports/components/customer-report-view"
import { getCustomerReportData } from "@/features/reports/api/reports.action"

export default async function CustomerReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getCustomerReportData(tenant)

  return (
    <PageShell pageName="Customer Report">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load customer report</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <CustomerReportView
          tenant={tenant}
          initialData={result.data ?? { rows: [], totalCustomers: 0, activeCustomers: 0, totalSpent: 0, avgSpent: 0 }}
        />
      )}
    </PageShell>
  )
}
