import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { StoreLocationsView } from "@/features/store-location/components/store-locations-view"
import { getStores } from "@/features/store-location/api/store-location.action"

export default async function StoresPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getStores(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load stores</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <StoreLocationsView tenant={tenant} initialData={result.data ?? []} />
}
