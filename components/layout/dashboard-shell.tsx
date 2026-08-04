import type { ReactNode } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
        <footer className="flex flex-col items-center justify-between gap-2 border-t px-6 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Karobar. All rights reserved.</span>
          <span>Built with Next.js &amp; shadcn/ui</span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
