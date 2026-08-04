import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { VariantAttributesView } from "@/features/variant-attribute/components/variant-attributes-view"
import { getVariantAttributes } from "@/features/variant-attribute/api/variant-attribute.action"

export default async function VariantAttributesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getVariantAttributes(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load variant attributes</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <VariantAttributesView tenant={tenant} initialData={result.data ?? []} />
}
