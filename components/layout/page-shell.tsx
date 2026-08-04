import type { ReactNode } from "react"
import { AppHeader } from "@/components/layout/app-header"

interface PageShellProps {
  pageName?: string
  children: ReactNode
}

export function PageShell({ pageName, children }: PageShellProps) {
  return (
    <>
      <AppHeader pageName={pageName} />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
    </>
  )
}
