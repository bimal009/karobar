import Image from "next/image"
import Link from "next/link"
import { Mail, MessageCircle } from "lucide-react"

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#blog" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Guides", href: "#" },
      { label: "API Docs", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
]

const social = [
  { icon: Mail, label: "Email", href: "#" },
  { icon: MessageCircle, label: "Chat with us", href: "#" },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-sm font-semibold">Stay updated, stay ahead</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              We&apos;re here for you — reach out any time.
            </p>
            <div className="mt-4 flex gap-2">
              {social.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex size-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <s.icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <Image src="/logo.svg" alt="Karobar" width={110} height={24} className="h-6 w-auto" />
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Karobar. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
