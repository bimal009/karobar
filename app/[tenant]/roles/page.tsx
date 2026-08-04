import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { RolesView } from "@/features/roles/components/roles-view"
import { getRoles } from "@/features/roles/api/role.action"

export default async function RolesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getRoles(tenant)

  if (result.error) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load roles</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <RolesView tenant={tenant} initialData={result.data ?? []} />
}
