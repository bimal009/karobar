import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { BrandsView } from "@/features/brand/components/brands-view"
import { getBrands } from "@/features/brand/api/brand.action"

export default async function BrandsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getBrands(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load brands</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <BrandsView tenant={tenant} initialData={result.data ?? []} />
}
