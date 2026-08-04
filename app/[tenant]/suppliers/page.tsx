import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { SuppliersView } from "@/features/supplier/components/suppliers-view"
import { getSuppliers } from "@/features/supplier/api/supplier.action"

export default async function SuppliersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSuppliers(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load suppliers</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <SuppliersView tenant={tenant} initialData={result.data ?? []} />
}
