import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { SalesReportView } from "@/features/reports/components/sales-report-view"
import { getSalesReportData } from "@/features/reports/api/reports.action"

export default async function SalesReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSalesReportData(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load sales report</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return (
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
  )
}
