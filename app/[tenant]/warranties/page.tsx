import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { WarrantiesView } from "@/features/warranty/components/warranties-view"
import { getWarranties } from "@/features/warranty/api/warranty.action"

export default async function WarrantiesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getWarranties(tenant)

  return (
    <PageShell pageName="Warranties">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load warranties</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <WarrantiesView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
