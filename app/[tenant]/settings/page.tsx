import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { SettingsView } from "@/features/settings/components/settings-view"
import { getSettings } from "@/features/settings/api/settings.action"

export default async function TenantSettingsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params
  const result = await getSettings(slug)

  if (result.error || !result.data) {
    return (
      <Empty>
        <EmptyMedia>
          <ShieldAlert />
        </EmptyMedia>
        <EmptyTitle>Can&apos;t load settings</EmptyTitle>
        <EmptyDescription>{result.message}</EmptyDescription>
      </Empty>
    )
  }

  return <SettingsView tenant={slug} data={result.data} />
}
