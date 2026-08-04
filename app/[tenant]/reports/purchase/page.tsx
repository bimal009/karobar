import { PurchaseReportView } from "@/features/reports/components/purchase-report-view"
import { getPurchaseReportData } from "@/features/reports/api/reports.action"

export default async function PurchaseReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getPurchaseReportData(tenant)

  return (
    <PurchaseReportView
      tenant={tenant}
      initialData={result.data ?? { suppliers: [], totalOrders: 0, totalDue: 0 }}
    />
  )
}
