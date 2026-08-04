import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { InvoiceReportView } from "@/features/reports/components/invoice-report-view"
import { getInvoiceReportData } from "@/features/reports/api/reports.action"

export default async function InvoiceReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getInvoiceReportData(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load invoice report</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <InvoiceReportView tenant={tenant} initialData={result.data ?? []} />
}
