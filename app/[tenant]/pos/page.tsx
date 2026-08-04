import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PosView } from "@/features/pos/components/pos-view"
import { getPosData } from "@/features/pos/api/pos.action"

export default async function PosPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getPosData(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load POS</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <PosView tenant={tenant} initialData={result.data ?? { categories: [], products: [] }} />
}
