import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-muted/30 px-4 py-16">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      <Link href="/" className="relative z-10 mb-8 flex items-center">
        <Image src="/logo.svg" alt="Karobar" width={140} height={31} priority className="h-8 w-auto" />
      </Link>
      <div className="relative z-10 w-full max-w-[440px] rounded-xl border bg-card p-8 shadow-lg">
        {children}
      </div>
      <p className="relative z-10 mt-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Karobar. All rights reserved.
      </p>
    </div>
  )
}
