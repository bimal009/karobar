import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { LowStockProductsView } from "@/features/product/components/low-stock-products-view"
import { getLowStockProducts } from "@/features/product/api/product.action"

export default async function LowStocksPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getLowStockProducts(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load low stock products</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <LowStockProductsView tenant={tenant} initialData={result.data ?? []} />
}
