import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { CreateProductView } from "@/features/product/components/create-product-view"
import { getProductCreateFormData } from "@/features/product/api/product.action"

export default async function CreateProductPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getProductCreateFormData(tenant)

  if (result.error || !result.data) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load the product form</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <CreateProductView tenant={tenant} data={result.data} />
}
