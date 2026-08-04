import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { SupplierReportView } from "@/features/reports/components/supplier-report-view"
import { getSupplierReportData } from "@/features/reports/api/reports.action"

export default async function SupplierReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSupplierReportData(tenant)

  return (
    <PageShell pageName="Supplier Report">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load supplier report</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <SupplierReportView
          tenant={tenant}
          initialData={result.data ?? { rows: [], totalSuppliers: 0, activeSuppliers: 0, totalDue: 0, avgDue: 0 }}
        />
      )}
    </PageShell>
  )
}
