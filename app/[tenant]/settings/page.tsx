import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { SettingsView } from "@/features/settings/components/settings-view"
import { getSettings } from "@/features/settings/api/settings.action"

export default async function TenantSettingsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params
  const result = await getSettings(slug)

  return (
    <PageShell pageName="Settings">
      {result.error || !result.data ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load settings</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <SettingsView tenant={slug} data={result.data} />
      )}
    </PageShell>
  )
}
