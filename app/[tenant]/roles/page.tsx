import { ShieldAlert } from "lucide-react"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PageShell } from "@/components/layout/page-shell"
import { RolesView } from "@/features/roles/components/roles-view"
import { getRoles } from "@/features/roles/api/role.action"

export default async function RolesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getRoles(tenant)

  return (
    <PageShell pageName="Roles & Permissions">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load roles</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <RolesView
          tenant={tenant}
          initialData={{
            rows: result.data ?? [],
            meta: result.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
          }}
        />
      )}
    </PageShell>
  )
}
