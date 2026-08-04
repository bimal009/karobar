import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ShieldAlert } from "lucide-react"
import { PageShell } from "@/components/layout/page-shell"
import { CustomersView } from "@/features/customer/components/customers-view"
import { getCustomers } from "@/features/customer/api/customer.action"

export default async function CustomersPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  const result = await getCustomers(tenant)

  return (
    <PageShell pageName="Customers">
      {result.error ? (
        <Empty>
          <EmptyMedia>
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Can&apos;t load customers</EmptyTitle>
          <EmptyDescription>{result.message}</EmptyDescription>
        </Empty>
      ) : (
        <CustomersView tenant={tenant} initialData={result.data ?? []} />
      )}
    </PageShell>
  )
}
