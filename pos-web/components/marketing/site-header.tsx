"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { label: "Features", href: "#features", chevron: true },
  { label: "Pricing", href: "#pricing", chevron: false },
  { label: "Resources", href: "#resources", chevron: true },
  { label: "About", href: "#about", chevron: false },
]

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Karobar" width={135} height={30} priority className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              {link.chevron && <ChevronDown className="size-3.5" />}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button render={<Link href="/acme-retail/dashboard">Get Started</Link>} />
        </div>

        <button
          className="flex size-9 items-center justify-center rounded-md md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t bg-background transition-[max-height] duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 border-t pt-3">
            <Button className="w-full" render={<Link href="/acme-retail/dashboard">Get Started</Link>} />
          </div>
        </nav>
      </div>
    </header>
  )
}
