import Link from "next/link"
import {
  ArrowRight,
  Coins,
  LayoutGrid,
  Play,
  Rocket,
  Shield,
  Sparkles,
  Star,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { DashboardPreview } from "@/components/marketing/dashboard-preview"
import { PricingSection } from "@/components/marketing/pricing-section"

const businessTypes = [
  "Retail",
  "Food & Beverage",
  "Salons & Spa",
  "Pharmacies",
  "Supermarket",
  "Clothing Stores",
  "Electronics",
  "Jewelry",
  "and more...",
]

const capabilities = [
  {
    icon: WifiOff,
    title: "Works Offline",
    description: "Keep your business running, even without internet.",
  },
  {
    icon: LayoutGrid,
    title: "All-in-One Platform",
    description: "Manage everything from sales, inventory to reports.",
  },
  {
    icon: Coins,
    title: "Multi-Currency",
    description: "Sell anywhere, in any currency, with ease.",
  },
]

const industries = [
  {
    name: "Bakery & Cafe",
    tone: "from-amber-500 to-orange-600",
    features: ["Order Management", "Recipe Tracking"],
  },
  {
    name: "Fashion & Apparel",
    tone: "from-fuchsia-500 to-pink-600",
    features: ["Variant Management", "Loyalty Programs"],
  },
  {
    name: "Grocery & Dairy",
    tone: "from-emerald-500 to-teal-600",
    features: ["Stock Alerts", "Store Transfer"],
  },
]

const stats = [
  { value: "5+", label: "Years of Trust" },
  { value: "30+", label: "Powerful Features" },
  { value: "20+", label: "Seamless Integrations" },
  { value: "$29", label: "Starting Price" },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Owner, Acme Retail",
    quote:
      "Karobar replaced three separate tools for us. Our till staff picked up the checkout flow in a single shift.",
  },
  {
    name: "Daniel Kim",
    role: "Ops Lead, Urban Mart",
    quote:
      "Stock transfers between our two stores used to be a spreadsheet nightmare. Now it's just a few clicks.",
  },
]

const process = [
  { step: "01", title: "Sign Up", description: "Create your account in under a minute — no credit card needed." },
  { step: "02", title: "Configure", description: "Set up your stores, staff, and product catalog your way." },
  { step: "03", title: "Grow", description: "Sell in-store or online while Karobar handles the busywork." },
]

const blogPosts = [
  {
    title: "How Karobar helped a retail chain grow 2x faster",
    date: "April 21, 2026",
    tone: "from-blue-500 to-indigo-600",
  },
  {
    title: "5 ways to reduce stock loss with smart POS reporting",
    date: "March 15, 2026",
    tone: "from-emerald-500 to-teal-600",
  },
]

const ctaFeatures = [
  { icon: Shield, label: "Secure & Reliable" },
  { icon: Wifi, label: "Works Offline" },
  { icon: Sparkles, label: "Easy to Use" },
  { icon: Rocket, label: "Scalable" },
]

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:pt-24">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="size-3" /> Trusted by 10,000+ businesses across the globe
              </Badge>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                The platform that{" "}
                <span className="text-primary underline decoration-primary/30 underline-offset-4">simplifies</span>{" "}
                your business operations
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
                Karobar is a powerful, easy-to-use platform built for seamless sales, inventory,
                staff, and customer management — all in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" render={<Link href="/acme-retail/dashboard" />}>
                  Start Free Trial <ArrowRight />
                </Button>
                <Button size="lg" variant="ghost" render={<Link href="/acme-retail/dashboard" />}>
                  <Play className="fill-current" /> See How It Works
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                {[
                  { value: "200+", label: "Happy Businesses" },
                  { value: "20+", label: "Countries Served" },
                  { value: "30+", label: "Advanced Features" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto mt-14 max-w-4xl">
              <DashboardPreview />
              <Card className="absolute -right-2 -top-6 hidden gap-1 p-3 shadow-xl sm:-right-8 sm:block">
                <CardContent className="flex items-center gap-2 p-0">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">4.9/5.0</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-sm font-medium text-muted-foreground">Works with:</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {businessTypes.map((type) => (
                <Badge key={type} variant="outline" className="rounded-full px-3 py-1 text-sm font-normal">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {capabilities.map((c) => (
              <Card key={c.title} className="ring-border/50">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="resources" className="border-y bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Configure for the businesses that actually use POS every hour
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                Karobar works the way you do. Customize features, workflows, and access so your
                team stays on what matters.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {industries.map((industry) => (
                <div key={industry.name} className="overflow-hidden rounded-xl border bg-card">
                  <div className={`flex h-32 items-end bg-gradient-to-br p-4 ${industry.tone}`}>
                    <h3 className="text-lg font-semibold text-white">{industry.name}</h3>
                  </div>
                  <ul className="flex flex-col gap-2 p-4">
                    {industry.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="#" className="text-sm font-medium text-primary hover:underline">
                Explore all industries →
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border p-6 text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="border-y bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex justify-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-5 fill-current" />
                ))}
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by businesses across the world
              </h2>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {testimonials.map((t) => (
                <Card key={t.name} className="ring-border/50">
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-2 flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback>{t.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple Process</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {process.map((p) => (
              <div key={p.step} className="text-center">
                <span className="text-sm font-bold text-primary">{p.step}</span>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
          <Card className="mx-auto mt-14 max-w-xl ring-border/50">
            <CardContent className="flex flex-col items-center gap-3 text-center">
              <UserPlus className="size-6 text-primary" />
              <h3 className="font-semibold">Need help? We&apos;re here for you</h3>
              <Button variant="outline" render={<Link href="#" />}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </section>

        <section id="blog" className="border-y bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From the Blog</h2>
                <p className="mt-2 text-muted-foreground">Tips, stories, and updates</p>
              </div>
              <Link href="#" className="hidden text-sm font-medium text-primary hover:underline sm:block">
                View all articles →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {blogPosts.map((post) => (
                <div key={post.title} className="overflow-hidden rounded-xl border bg-card">
                  <div className={`h-40 bg-gradient-to-br ${post.tone}`} />
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                    <h3 className="mt-1 font-semibold text-balance">{post.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Card className="overflow-hidden bg-primary text-primary-foreground ring-0">
            <CardContent className="flex flex-col gap-10 py-4">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Everything your business needs, in one place
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80 text-pretty">
                  Powerful features designed to simplify your operations.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ctaFeatures.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 p-4"
                  >
                    <f.icon className="size-5 shrink-0" />
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Button size="lg" variant="secondary" render={<Link href="/acme-retail/dashboard" />}>
                  Start your free trial <ArrowRight />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
