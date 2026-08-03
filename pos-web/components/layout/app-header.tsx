"use client"

import Link from "next/link"
import { Bell, LogOut, Search, Settings, ShoppingCart, User, UserCog } from "lucide-react"
import { parseAsStringEnum, useQueryState } from "nuqs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import type { UserRole } from "@/lib/types"

interface AppHeaderProps {
  userName: string
  userInitial: string
  userRole: string
  posHref?: string
  contextLabel?: string
  loginHref: string
}

export function AppHeader({
  userName,
  userInitial,
  userRole,
  posHref,
  contextLabel,
  loginHref,
}: AppHeaderProps) {
  const [viewAs, setViewAs] = useQueryState(
    "viewAs",
    parseAsStringEnum<UserRole>(["admin", "manager", "salesperson"])
  )
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="relative hidden max-w-sm flex-1 items-center sm:flex">
        <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-8 pr-12" />
        <Kbd className="absolute right-2">⌘K</Kbd>
      </div>
      {contextLabel && (
        <Badge variant="outline" className="hidden lg:inline-flex">
          {contextLabel}
        </Badge>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        {posHref && (
          <Button render={<Link href={posHref} />} size="sm" className="hidden sm:inline-flex">
            <ShoppingCart /> POS
          </Button>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="relative" aria-label="Notifications" />}
          >
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">Low stock alert</span>
                <span className="text-xs text-muted-foreground">Samsung Galaxy S24 is running low (8 left)</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">New order received</span>
                <span className="text-xs text-muted-foreground">Order INV-20260731-002 · $264.57</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5">
                <span className="text-sm font-medium">Product expiring soon</span>
                <span className="text-xs text-muted-foreground">L&apos;Oreal Revitalift Serum expires in 29 days</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-muted" />}
          >
            <Avatar size="sm">
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{userName}</span>
                <span className="text-xs font-normal capitalize text-muted-foreground">
                  {viewAs ?? userRole}
                  {viewAs && " (preview)"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Settings
              </DropdownMenuItem>
              {posHref && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    <UserCog className="size-3.5" /> Preview as (demo)
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={viewAs ?? userRole}
                    onValueChange={(value) => setViewAs(value === userRole ? null : (value as UserRole))}
                  >
                    <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="manager">Manager</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="salesperson">Salesperson</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href={loginHref} />} variant="destructive">
                <LogOut /> Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
