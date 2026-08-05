import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { ExpiredProductsView } from "@/features/product/components/expired-products-view"
import { getExpiredProducts } from "@/features/product/api/product.action"

export default async function ExpiredProductsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getExpiredProducts(tenant)

  return (
    <PageShell pageName="Expired Products">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load expired products</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <ExpiredProductsView
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
