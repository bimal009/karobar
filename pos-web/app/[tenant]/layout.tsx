import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { getTenantBySlug } from "@/lib/dummy-data"
import { getCurrentUser } from "@/lib/dummy-data/users"

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: slug } = await params
  const tenant = getTenantBySlug(slug)

  if (!tenant) {
    notFound()
  }

  const user = getCurrentUser(tenant.id)

  return (
    <DashboardShell
      tenantSlug={tenant.slug}
      brand={{ href: `/${tenant.slug}/dashboard`, initial: tenant.logoInitial, name: tenant.name, subtitle: "Powered by Karobar" }}
      userName={user.name}
      userInitial={user.avatarInitial}
      userRole={user.role}
      posHref={`/${tenant.slug}/pos`}
      contextLabel={tenant.name}
      loginHref="/login"
    >
      {children}
    </DashboardShell>
  )
}
