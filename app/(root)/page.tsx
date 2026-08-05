import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ShoppingCart,
  Store,
  Users2,
} from "lucide-react"

import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { HeroFloatingCards } from "@/components/marketing/hero-mockups"
import {
  PosMockup,
  StockMockup,
  SalesReportMockup,
  ReportHighlightCard,
} from "@/components/marketing/product-mockups"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const heading = "font-[family-name:var(--font-marketing-heading)]"
const heroGradient =
  "bg-gradient-to-b from-[var(--brand-gradient-from)] via-[var(--brand-gradient-via)] to-[var(--brand-gradient-to)]"
const ctaGradient = "bg-gradient-to-br from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)]"

const businessTypes = ["Retail stores", "Restaurants", "Pharmacies", "Wholesale"]

const stats = [
  { value: "1.4s", label: "Average time to close a bill" },
  { value: "98.6%", label: "Stock accuracy after month one" },
  { value: "12", label: "Counters on a single licence" },
  { value: "3", label: "Languages — English, Hindi, Malayalam" },
]

const workflowTabs = [
  {
    value: "sell",
    label: "Sell",
    icon: ShoppingCart,
    title: "A till that keeps count as it bills",
    body: "Scan, weigh, split the payment, print or send the bill. Every line written at the counter is the same line inventory reads — there's nothing left to reconcile.",
    mockup: <PosMockup />,
  },
  {
    value: "stock",
    label: "Track stock",
    icon: Boxes,
    title: "Reorder before the shelf goes empty",
    body: "Karobar watches how fast each SKU moves and flags it the moment stock left equals the days your supplier takes to restock. One glance, one approval.",
    mockup: <StockMockup />,
  },
  {
    value: "reports",
    label: "See reports",
    icon: BarChart3,
    title: "Every outlet, rolled into one report",
    body: "Compare margins by store and shift, and see the whole business as one number — without asking four managers for a spreadsheet.",
    mockup: <SalesReportMockup />,
  },
]

const pricingTiers = [
  {
    name: "Counter",
    price: "₹899",
    tag: null,
    body: "One till, unlimited bills, 500 SKUs, GST returns ready.",
  },
  {
    name: "Shop",
    price: "₹1,999",
    tag: "Most taken",
    body: "Four tills, unlimited SKUs, auto purchase orders, live stock sync.",
    accent: true,
  },
  {
    name: "Chain",
    price: "Talk to us",
    tag: null,
    body: "Every outlet, stock transfers, role controls, a named engineer.",
  },
]

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-background px-3 pt-3 sm:px-5 sm:pt-5">
        <div className={`relative overflow-hidden rounded-[32px] ${heroGradient} pb-20 pt-16 sm:pb-24 sm:pt-24`}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.25),transparent)]"
          />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
            <Badge className="rounded-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm">
              Inventory + point of sale, one login
            </Badge>
            <h1
              className={`${heading} mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-primary-foreground sm:text-6xl`}
            >
              Run Your Store Fast
              <br />
              and Accurate, with Karobar
            </h1>
            <p className="mt-5 max-w-xl text-balance text-base leading-7 text-primary-foreground/75 sm:text-lg">
              One system for the till and the stockroom. Every sale moves a number in inventory
              the instant it happens — so the shelf, the screen and the ledger never disagree.
            </p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                render={<Link href="/register" />}
                className="h-12 flex-1 cursor-pointer rounded-full bg-brand-navy text-base text-brand-navy-foreground hover:bg-brand-navy/85"
              >
                Start free trial
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/acme-retail/dashboard" />}
                className="h-12 flex-1 cursor-pointer rounded-full border-primary-foreground/30 bg-primary-foreground/10 text-base text-primary-foreground hover:bg-primary-foreground/20"
              >
                See live demo
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {businessTypes.map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/70">
                  <CheckCircle2 className="size-3.5 text-primary-foreground/50" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
            <HeroFloatingCards />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-background px-4 pb-16 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className={`${heading} text-3xl font-extrabold tabular-nums text-foreground sm:text-4xl`}>
                {s.value}
              </p>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow tabs */}
      <section id="counter" className="bg-card px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              How Karobar works
            </span>
            <h2 className={`${heading} mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl`}>
              One screen for the counter,
              <br className="hidden sm:block" /> the stockroom and the reports
            </h2>
          </div>

          <Tabs defaultValue="sell" className="mt-12 items-center">
            <TabsList className="h-auto gap-1 rounded-full bg-muted p-2 ring-1 ring-border/60">
              {workflowTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="cursor-pointer gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground data-active:bg-brand-navy data-active:text-brand-navy-foreground data-active:shadow-md"
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {workflowTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-10 w-full outline-none">
                <div className="grid items-center gap-10 sm:grid-cols-2">
                  <div className="order-2 sm:order-1">
                    <h3 className={`${heading} text-2xl font-bold text-foreground`}>{tab.title}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{tab.body}</p>
                  </div>
                  <div className="order-1 sm:order-2">{tab.mockup}</div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Reports section */}
      <section id="reports" className="bg-background px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-5xl items-center gap-12 sm:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Reports that write themselves
            </span>
            <h2 className={`${heading} mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl`}>
              Know what sold, what&apos;s left, and what to reorder
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              Sales, purchase and inventory reports update the second a bill closes. Filter by
              store, product or date range and export to print, PDF or spreadsheet — no
              end-of-day exports required.
            </p>
            <Button
              render={<Link href="/acme-retail/reports/sales" />}
              className="mt-6 cursor-pointer rounded-full bg-brand-navy text-brand-navy-foreground hover:bg-brand-navy/85"
            >
              Explore reports
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <ReportHighlightCard />
        </div>
      </section>

      {/* Team / branches section */}
      <section className="bg-card px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 sm:grid-cols-2">
            <div className="order-2 sm:order-1">
              <div className="relative flex h-64 items-center justify-center">
                <div className="w-56 -rotate-6 rounded-2xl bg-muted p-4 shadow-sm ring-1 ring-border">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      B
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Jhon Doe</p>
                      <Badge variant="secondary" className="mt-0.5">
                        System admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute right-6 top-2 w-52 rotate-6 rounded-2xl bg-card p-4 shadow-[0_20px_45px_-15px_rgba(9,20,66,0.35)] ring-1 ring-border">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Sita Rai</p>
                      <Badge variant="outline" className="mt-0.5">
                        Cashier · POS only
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-10 w-48 rounded-2xl bg-card p-3.5 shadow-[0_20px_45px_-15px_rgba(9,20,66,0.35)] ring-1 ring-border">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Store className="size-3.5" />
                    3 branches synced live
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 sm:order-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                Every branch, one login
              </span>
              <h2 className={`${heading} mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl`}>
                Transfer stock, compare stores, control who sees what
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                Move stock between branches, give cashiers counter-only access, and give
                managers the full picture — all from roles you set once and forget.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Role-based access per branch", "Stock transfer with an audit trail", "One bill, one ledger, every outlet"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware section */}
      <section className="bg-background px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 rounded-[28px] bg-brand-navy p-8 text-brand-navy-foreground sm:grid-cols-2 sm:p-12">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy-foreground/10 px-3 py-1 text-xs font-medium text-brand-navy-foreground/70">
                <Store className="size-3.5" />
                Built for the counter
              </span>
              <h2 className={`${heading} mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl`}>
                Plug in your hardware, and it just works
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-brand-navy-foreground/60">
                Barcode gun, weighing scale, thermal printer, cash drawer — connect them once and
                staff learn the counter in an afternoon, because there&apos;s only one screen to
                learn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Barcode scanner", "Thermal printer", "Cash drawer", "Weighing scale", "Multi-till setup", "Role-based logins"].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-brand-navy-foreground/15 bg-brand-navy-foreground/5 px-4 py-2 text-sm font-medium text-brand-navy-foreground/80"
                  >
                    {chip}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-card px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Pricing, per outlet, per month
            </span>
            <h2 className={`${heading} mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl`}>
              Straightforward pricing, no hidden fees
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-[24px] p-7 ${
                  tier.accent
                    ? "bg-brand-navy text-brand-navy-foreground ring-1 ring-brand-navy"
                    : "bg-muted text-foreground ring-1 ring-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className={`${heading} text-lg font-bold`}>{tier.name}</h3>
                  {tier.tag && (
                    <Badge className="rounded-full bg-primary text-primary-foreground">{tier.tag}</Badge>
                  )}
                </div>
                <p className={`${heading} mt-4 text-4xl font-extrabold tabular-nums`}>{tier.price}</p>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    tier.accent ? "text-brand-navy-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {tier.body}
                </p>
                <Button
                  render={<Link href="/register" />}
                  className={`mt-6 w-full cursor-pointer rounded-full ${
                    tier.accent
                      ? "bg-brand-navy-foreground text-brand-navy hover:bg-brand-navy-foreground/90"
                      : "bg-brand-navy text-brand-navy-foreground hover:bg-brand-navy/85"
                  }`}
                >
                  Choose {tier.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-background px-4 py-20 sm:px-8 sm:py-28">
        <figure className="mx-auto max-w-2xl text-center">
          <Users2 className="mx-auto size-8 text-primary/30" />
          <blockquote
            className={`${heading} mt-6 text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl`}
          >
            &ldquo;We stopped closing for stock-taking. The count is just correct on a Tuesday
            afternoon.&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted-foreground">
            R. Menon &middot; Four grocery outlets, Kochi
          </figcaption>
        </figure>
      </section>

      {/* Final CTA */}
      <section className="bg-card px-3 pb-3 sm:px-5 sm:pb-5">
        <div className={`relative overflow-hidden rounded-[32px] ${ctaGradient} px-6 py-16 text-center sm:py-20`}>
          <Image
            src="/whitelogo.svg"
            alt="Karobar"
            width={140}
            height={31}
            className="mx-auto h-7 w-auto opacity-90"
          />
          <h2
            className={`${heading} mx-auto mt-6 max-w-xl text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl`}
          >
            Open tomorrow on Karobar
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-primary-foreground/70">
            30 days free, no card required. Set up your first counter in under ten minutes.
          </p>
          <Button
            size="lg"
            render={<Link href="/register" />}
            className="mt-8 h-12 cursor-pointer rounded-full bg-primary-foreground px-8 text-base text-brand-navy hover:bg-primary-foreground/90"
          >
            Start free trial
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
