import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { PosView } from "@/features/pos/components/pos-view"
import { getPosData, searchPosProducts } from "@/features/pos/api/pos.action"

export default async function PosPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [dataResult, productsResult] = await Promise.all([getPosData(tenant), searchPosProducts(tenant)])

  if (dataResult.error) {
    return (
      <PageShell pageName="POS">
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load POS</EmptyTitle>
          <EmptyDescription>{dataResult.message}</EmptyDescription>
        </Empty>
      </PageShell>
    )
  }

  return (
    <PageShell pageName="POS">
      <PosView
        tenant={tenant}
        initialData={dataResult.data ?? { categories: [], customers: [] }}
        initialProducts={productsResult.data ?? []}
      />
    </PageShell>
  )
}
