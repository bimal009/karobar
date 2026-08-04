import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { ProductsView } from "@/features/product/components/products-view"
import { getProducts } from "@/features/product/api/product.action"

export default async function ProductsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getProducts(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load products</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <ProductsView tenant={tenant} initialData={result.data ?? []} />
}
