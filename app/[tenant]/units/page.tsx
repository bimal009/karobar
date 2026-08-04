import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { UnitsView } from "@/features/unit/components/units-view"
import { getUnits } from "@/features/unit/api/unit.action"

export default async function UnitsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getUnits(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load units</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <UnitsView tenant={tenant} initialData={result.data ?? []} />
}
