import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { BillersView } from "@/features/biller/components/billers-view"
import { getBillers } from "@/features/biller/api/biller.action"
import { getStores } from "@/features/store-location/api/store-location.action"

export default async function BillersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [billersResult, storesResult] = await Promise.all([getBillers(tenant), getStores(tenant)])

  if (billersResult.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load billers</EmptyTitle>
        <EmptyDescription>{billersResult.message}</EmptyDescription>
      </Empty>
    )
  }

  return (
    <BillersView tenant={tenant} initialData={billersResult.data ?? []} stores={storesResult.data ?? []} />
  )
}
