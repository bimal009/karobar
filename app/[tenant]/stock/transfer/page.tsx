import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { StockTransferView } from "@/features/stock/components/stock-transfer-view"
import { getStockFormOptions, getStockMovements } from "@/features/stock/api/stock.action"

export default async function StockTransferPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [movementsResult, optionsResult] = await Promise.all([
    getStockMovements(tenant, { type: "transfer" }),
    getStockFormOptions(tenant),
  ])

  return (
    <PageShell pageName="Stock Transfer">
      {movementsResult.error || optionsResult.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load stock transfers</EmptyTitle>
          <EmptyDescription>{movementsResult.message || optionsResult.message}</EmptyDescription>
        </Empty>
      ) : (
        <StockTransferView
          tenant={tenant}
          initialData={{
            rows: movementsResult.data ?? [],
            meta: movementsResult.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
          }}
          formOptions={optionsResult.data ?? { branches: [], products: [] }}
        />
      )}
    </PageShell>
  )
}
