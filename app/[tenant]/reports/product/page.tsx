import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { ProductReportView } from "@/features/reports/components/product-report-view"
import { getProductReportData } from "@/features/reports/api/reports.action"

export default async function ProductReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getProductReportData(tenant)

  return (
    <PageShell pageName="Product Report">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load product report</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <ProductReportView
          tenant={tenant}
          initialData={result.data ?? { rows: [], totalProducts: 0, totalRevenue: 0, totalUnitsSold: 0, avgMargin: 0 }}
        />
      )}
    </PageShell>
  )
}
