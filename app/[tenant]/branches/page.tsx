import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { BranchesView } from "@/features/branch/components/branches-view"
import { getBranches } from "@/features/branch/api/branch.action"

export default async function BranchesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getBranches(tenant)

  return (
    <PageShell pageName="Branches">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load branches</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <BranchesView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
