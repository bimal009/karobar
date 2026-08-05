import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { LowStockProductsView } from "@/features/product/components/low-stock-products-view"
import { getLowStockProducts } from "@/features/product/api/product.action"

export default async function LowStocksPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getLowStockProducts(tenant)

  return (
    <PageShell pageName="Low Stocks">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load low stock products</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <LowStockProductsView
          tenant={tenant}
          initialData={{
            rows: result.data ?? [],
            meta: result.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
          }}
        />
      )}
    </PageShell>
  )
}
