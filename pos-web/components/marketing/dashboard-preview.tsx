import { ArrowUpRight, Package, ShoppingCart, Users } from "lucide-react"

const bars = [40, 65, 50, 80, 60, 95, 70]

export function DashboardPreview() {
  return (
    <div className="rounded-2xl border bg-card p-3 shadow-2xl ring-1 ring-foreground/10 sm:p-4">
      <div className="flex items-center gap-1.5 border-b px-2 pb-3">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-xs text-muted-foreground">app.karobar.com/acme-retail/dashboard</span>
      </div>
      <div className="grid gap-3 p-2 pt-4 sm:grid-cols-3">
        {[
          { label: "Total Sales", value: "$48,988", icon: ShoppingCart, tone: "bg-primary text-primary-foreground" },
          { label: "Customers", value: "4,896", icon: Users, tone: "bg-card ring-1 ring-border" },
          { label: "Products", value: "1,204", icon: Package, tone: "bg-card ring-1 ring-border" },
        ].map((stat) => (
          <div key={stat.label} className={`flex flex-col gap-3 rounded-xl p-4 ${stat.tone}`}>
            <div className="flex items-center justify-between">
              <stat.icon className="size-4 opacity-80" />
              <span className="flex items-center gap-0.5 text-xs opacity-80">
                <ArrowUpRight className="size-3" /> 12%
              </span>
            </div>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs opacity-70">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mx-2 mb-2 mt-1 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Revenue</span>
          <span className="text-xs text-emerald-600">+40% vs last year</span>
        </div>
        <div className="mt-4 flex h-28 items-end gap-2 sm:h-32">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
