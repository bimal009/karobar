import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import type { UserRole } from "@/lib/types"

interface DashboardShellProps {
  tenantSlug?: string
  role?: UserRole
  brand: { href: string; initial: string; name: string; subtitle: string }
  userName: string
  userInitial: string
  userRole: string
  posHref?: string
  contextLabel?: string
  loginHref: string
  children: ReactNode
}

export function DashboardShell({
  tenantSlug,
  role,
  brand,
  userName,
  userInitial,
  userRole,
  posHref,
  contextLabel,
  loginHref,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar tenantSlug={tenantSlug} role={role} brand={brand} />
      <SidebarInset>
        <AppHeader
          userName={userName}
          userInitial={userInitial}
          userRole={userRole}
          posHref={posHref}
          contextLabel={contextLabel}
          loginHref={loginHref}
        />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
        <footer className="flex flex-col items-center justify-between gap-2 border-t px-6 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Karobar. All rights reserved.</span>
          <span>Built with Next.js &amp; shadcn/ui</span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
