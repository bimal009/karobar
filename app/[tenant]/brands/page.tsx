import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { BrandsView } from "@/features/brand/components/brands-view"
import { getBrands } from "@/features/brand/api/brand.action"

export default async function BrandsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getBrands(tenant)

  return (
    <PageShell pageName="Brands">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load brands</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <BrandsView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
