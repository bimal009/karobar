import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { MembersView } from "@/features/members/components/members-view"
import { getMemberFormOptions, getMembers } from "@/features/members/api/member.action"

export default async function BranchMembersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const [membersResult, optionsResult] = await Promise.all([
    getMembers(tenant),
    getMemberFormOptions(tenant),
  ])

  if (membersResult.error || optionsResult.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load members</EmptyTitle>
        <EmptyDescription>{membersResult.message || optionsResult.message}</EmptyDescription>
      </Empty>
    )
  }

  return (
    <MembersView
      tenant={tenant}
      initialData={membersResult.data ?? []}
      initialOptions={optionsResult.data ?? { roles: [], branches: [] }}
    />
  )
}
