import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { CustomerReportView } from "@/features/reports/components/customer-report-view"
import { getCustomerReportData } from "@/features/reports/api/reports.action"

export default async function CustomerReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getCustomerReportData(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load customer report</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <CustomerReportView tenant={tenant} initialData={result.data ?? []} />
}
