import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { ProductsView } from "@/features/product/components/products-view"
import { getProducts } from "@/features/product/api/product.action"

export default async function ProductsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getProducts(tenant)

  return (
    <PageShell pageName="Products">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load products</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <ProductsView
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
