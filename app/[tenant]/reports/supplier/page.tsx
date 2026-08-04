import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { SupplierReportView } from "@/features/reports/components/supplier-report-view"
import { getSupplierReportData } from "@/features/reports/api/reports.action"

export default async function SupplierReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSupplierReportData(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load supplier report</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <SupplierReportView tenant={tenant} initialData={result.data ?? []} />
}
