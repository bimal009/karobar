import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { CustomAttributesView } from "@/features/custom-attribute/components/custom-attributes-view"
import { getCustomAttributes } from "@/features/custom-attribute/api/custom-attribute.action"

export default async function CustomAttributesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getCustomAttributes(tenant)

  return (
    <PageShell pageName="Custom Attributes">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load custom attributes</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <CustomAttributesView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
