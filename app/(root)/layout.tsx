import type { ReactNode } from "react"
import { Manrope } from "next/font/google"
import { cn } from "@/lib/utils"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-marketing-heading" })

export default function RootMarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(manrope.variable, "flex min-h-screen flex-col bg-background text-foreground")}>
      {children}
    </div>
  )
}
