import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { MembersView } from "@/features/members/components/members-view"
import { getMemberFormOptions, getMembers } from "@/features/members/api/member.action"

export default async function BranchMembersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [membersResult, optionsResult] = await Promise.all([
    getMembers(tenant),
    getMemberFormOptions(tenant),
  ])

  return (
    <PageShell pageName="Branch Members">
      {membersResult.error || optionsResult.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load members</EmptyTitle>
          <EmptyDescription>{membersResult.message || optionsResult.message}</EmptyDescription>
        </Empty>
      ) : (
        <MembersView
          tenant={tenant}
          initialData={{
            rows: membersResult.data ?? [],
            meta: membersResult.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
          }}
          initialOptions={optionsResult.data ?? { roles: [], branches: [] }}
        />
      )}
    </PageShell>
  )
}
