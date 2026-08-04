import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { BillersView } from "@/features/biller/components/billers-view"
import { getBillers } from "@/features/biller/api/biller.action"
import { getStores } from "@/features/store-location/api/store-location.action"

export default async function BillersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [billersResult, storesResult] = await Promise.all([getBillers(tenant), getStores(tenant)])

  return (
    <PageShell pageName="Billers">
      {billersResult.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load billers</EmptyTitle>
          <EmptyDescription>{billersResult.message}</EmptyDescription>
        </Empty>
      ) : (
        <BillersView tenant={tenant} initialData={billersResult.data ?? []} stores={storesResult.data ?? []} />
      )}
    </PageShell>
  )
}
