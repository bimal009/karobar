import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { WarehousesView } from "@/features/warehouse/components/warehouses-view"
import { getWarehouses } from "@/features/warehouse/api/warehouse.action"

export default async function WarehousesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getWarehouses(tenant)

  return (
    <PageShell pageName="Warehouses">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load warehouses</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <WarehousesView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
