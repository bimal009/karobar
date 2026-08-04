import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { StockAdjustmentView } from "@/features/stock/components/stock-adjustment-view"
import { getStockFormOptions, getStockMovements } from "@/features/stock/api/stock.action"

export default async function StockAdjustmentPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [movementsResult, optionsResult] = await Promise.all([
    getStockMovements(tenant, "adjustment"),
    getStockFormOptions(tenant),
  ])

  return (
    <PageShell pageName="Stock Adjustment">
      {movementsResult.error || optionsResult.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load stock adjustments</EmptyTitle>
          <EmptyDescription>{movementsResult.message || optionsResult.message}</EmptyDescription>
        </Empty>
      ) : (
        <StockAdjustmentView
          tenant={tenant}
          initialData={movementsResult.data ?? []}
          formOptions={optionsResult.data ?? { branches: [], products: [] }}
        />
      )}
    </PageShell>
  )
}
