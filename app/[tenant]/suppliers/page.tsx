import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { SuppliersView } from "@/features/supplier/components/suppliers-view"
import { getSuppliers } from "@/features/supplier/api/supplier.action"

export default async function SuppliersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getSuppliers(tenant)

  return (
    <PageShell pageName="Suppliers">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load suppliers</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <SuppliersView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
