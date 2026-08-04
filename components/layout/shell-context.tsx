"use client"

import * as React from "react"
import type { UserRole } from "@/lib/types"

export interface ShellData {
  /** Pass the tenant slug for a tenant workspace shell, or omit for the superadmin shell. */
  tenantSlug?: string
  /** The signed-in user's real role. */
  role?: UserRole
  brand: { href: string; initial: string; name: string; subtitle: string }
  /** Other stores the signed-in user belongs to, for the store switcher. Only used for tenant shells. */
  stores?: { slug: string; name: string; logo: string | null }[]
  userName: string
  userInitial: string
  userRole: string
  posHref?: string
  loginHref: string
}

const ShellContext = React.createContext<ShellData | null>(null)

export function ShellProvider({ value, children }: { value: ShellData; children: React.ReactNode }) {
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell(): ShellData {
  const ctx = React.useContext(ShellContext)
  if (!ctx) throw new Error("useShell must be used within a ShellProvider")
  return ctx
}
