import type { ReactNode } from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export const dynamic = "force-dynamic"

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      brand={{ href: "/superadmin", initial: "N", name: "Karobar", subtitle: "Super Admin" }}
      userName="Adrian Miles"
      userInitial="A"
      userRole="Super Admin"
      contextLabel="Platform Console"
      loginHref="/login"
    >
      {children}
    </DashboardShell>
  )
}
