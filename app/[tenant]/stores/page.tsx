import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { StoreLocationsView } from "@/features/store-location/components/store-locations-view"
import { getStoreLocations } from "@/features/store-location/api/store-location.action"

export default async function StoresPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getStoreLocations(tenant)

  return (
    <PageShell pageName="Stores">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load stores</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <StoreLocationsView
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
