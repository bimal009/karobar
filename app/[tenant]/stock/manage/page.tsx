import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { StockManageView } from "@/features/stock/components/stock-manage-view"
import { getBranchStock, getStockFormOptions } from "@/features/stock/api/stock.action"

export default async function ManageStockPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [stockResult, optionsResult] = await Promise.all([getBranchStock(tenant), getStockFormOptions(tenant)])

  if (stockResult.error || optionsResult.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load stock</EmptyTitle>
        <EmptyDescription>{stockResult.message || optionsResult.message}</EmptyDescription>
      </Empty>
    )
  }

  return (
    <StockManageView
      tenant={tenant}
      initialData={stockResult.data ?? []}
      formOptions={optionsResult.data ?? { branches: [], products: [] }}
    />
  )
}
