import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { tenants } from "@/lib/dummy-data"

const plans = [
  { name: "Starter", price: 29, features: ["1 store", "3 staff accounts", "Core POS & inventory"] },
  { name: "Growth", price: 79, features: ["5 stores", "Unlimited staff", "Advanced reports", "Stock transfer"] },
  { name: "Enterprise", price: null, features: ["Unlimited stores", "Dedicated console", "Custom roles", "SLA"] },
]

export default function SuperAdminBillingPage() {
  const revenue = tenants.reduce((sum, t) => sum + t.mrr, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing & Plans" crumbs={[{ label: "Dashboard", href: "/superadmin" }, { label: "Billing" }]} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
            <p className="mt-1 text-2xl font-bold">${revenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Paying Tenants</p>
            <p className="mt-1 text-2xl font-bold">{tenants.filter((t) => t.mrr > 0).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">On Trial</p>
            <p className="mt-1 text-2xl font-bold">{tenants.filter((t) => t.status === "trial").length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                <Badge variant="secondary">
                  {tenants.filter((t) => t.plan === plan.name.toLowerCase()).length} tenants
                </Badge>
              </div>
              <p className="text-2xl font-bold">{plan.price ? `$${plan.price}` : "Custom"}</p>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
