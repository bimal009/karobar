import type { ReactNode } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ShellProvider } from "@/components/layout/shell-context"

export const dynamic = "force-dynamic"

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ShellProvider
      value={{
        brand: { href: "/superadmin", initial: "N", name: "Karobar", subtitle: "Super Admin" },
        userName: "Adrian Miles",
        userInitial: "A",
        userRole: "Super Admin",
        loginHref: "/login",
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </ShellProvider>
  )
}
