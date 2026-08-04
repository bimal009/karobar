import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { InventoryReportView } from "@/features/reports/components/inventory-report-view"
import { getInventoryReportData } from "@/features/reports/api/reports.action"

export default async function InventoryReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getInventoryReportData(tenant)

  return (
    <PageShell pageName="Inventory Report">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load inventory report</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <InventoryReportView
          tenant={tenant}
          initialData={result.data ?? { products: [], outOfStock: 0, lowStock: 0, stockValue: 0 }}
        />
      )}
    </PageShell>
  )
}
