import type { ReactNode } from "react"
import { notFound, redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ShellProvider } from "@/components/layout/shell-context"
import db from "@/lib/database/db"
import { user } from "@/lib/database/schemas"
import { getStoreContext } from "@/lib/database/queries/store-context"
import { getMyStores } from "@/features/store/api/store.action"
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/common/errors"
import type { UserRole } from "@/lib/types"

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: slug } = await params

  let ctx
  try {
    ctx = await getStoreContext(slug)
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login")
    if (error instanceof NotFoundError || error instanceof ForbiddenError) notFound()
    throw error
  }

  const [currentUser] = await db
    .select({ name: user.name, image: user.image })
    .from(user)
    .where(eq(user.id, ctx.userId))
    .limit(1)

  const storesResult = await getMyStores()

  const userName = currentUser?.name ?? "Account"
  const navRole: UserRole = ctx.role.canViewDashboard ? "admin" : "salesperson"

  return (
    <ShellProvider
      value={{
        tenantSlug: ctx.store.slug,
        role: navRole,
        brand: {
          href: `/${ctx.store.slug}/dashboard`,
          initial: ctx.store.name.charAt(0).toUpperCase(),
          name: ctx.store.name,
          subtitle: "Powered by Karobar",
        },
        stores: storesResult.data ?? [],
        userName,
        userInitial: userName.charAt(0).toUpperCase(),
        userRole: ctx.role.name,
        posHref: `/${ctx.store.slug}/pos`,
        loginHref: "/login",
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </ShellProvider>
  )
}
