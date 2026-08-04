import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { InvoiceReportView } from "@/features/reports/components/invoice-report-view"
import { getInvoiceReportData } from "@/features/reports/api/reports.action"

export default async function InvoiceReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getInvoiceReportData(tenant)

  return (
    <PageShell pageName="Invoice Report">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load invoice report</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <InvoiceReportView
          tenant={tenant}
          initialData={result.data ?? { rows: [], totalInvoices: 0, totalAmount: 0, paidCount: 0, dueCount: 0 }}
        />
      )}
    </PageShell>
  )
}
