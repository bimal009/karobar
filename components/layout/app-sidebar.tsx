"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { parseAsStringEnum, useQueryState } from "nuqs"
import { cn } from "@/lib/utils"
import { getTenantNav, superadminNav } from "@/lib/nav-config"
import type { UserRole } from "@/lib/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  /** Pass the tenant slug for a tenant workspace sidebar, or omit for the superadmin sidebar. */
  tenantSlug?: string
  /** The signed-in user's real role. Can be overridden client-side via ?viewAs= for demo purposes. */
  role?: UserRole
  brand: {
    href: string
    initial: string
    name: string
    subtitle: string
  }
}

export function AppSidebar({ tenantSlug, role = "admin", brand }: AppSidebarProps) {
  const pathname = usePathname()
  const [viewAs] = useQueryState(
    "viewAs",
    parseAsStringEnum<UserRole>(["admin", "manager", "salesperson"])
  )
  const effectiveRole = viewAs ?? role
  const groups = tenantSlug ? getTenantNav(tenantSlug, effectiveRole) : superadminNav

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b h-16 justify-center">
        <Link href={brand.href} className="flex items-center gap-2 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {brand.initial}
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold">{brand.name}</span>
            <span className="text-[11px] text-muted-foreground">{brand.subtitle}</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href + "/"))
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <item.icon className={cn(isActive && "text-primary")} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
