import type { ReactNode } from "react"

export default function RootMarketingLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen flex-col">{children}</div>
}
