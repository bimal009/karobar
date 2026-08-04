import Image from "next/image"
import Link from "next/link"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Point of sale", href: "#counter" },
      { label: "Inventory", href: "#stock" },
      { label: "Reports", href: "#reports" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Live demo", href: "/acme-retail/dashboard" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-[#070c1f] text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:px-[clamp(20px,5vw,72px)]">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div>
            <Image src="/whitelogo.svg" alt="Karobar" width={130} height={29} className="h-6 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/50">
              One system for the till and the stockroom — built for retail, restaurants and
              wholesale counters.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Karobar. All rights reserved.</p>
          <p>Support in English, Hindi and Malayalam.</p>
        </div>
      </div>
    </footer>
  )
}
