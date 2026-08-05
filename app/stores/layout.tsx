import type { ReactNode } from "react"
import Link from "next/link"
import { LogOut } from "lucide-react"

export default function StoresLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-8">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Karobar" className="h-6 w-auto" />
        </Link>
        <Link
          href="/login"
          className="ml-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-4" />
          Log out
        </Link>
      </header>
      <main className="flex flex-1 flex-col p-4 md:p-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
    </div>
  )
}
