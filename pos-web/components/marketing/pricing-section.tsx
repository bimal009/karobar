"use client"

import * as React from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const plans = [
  {
    name: "Professional",
    monthly: 50,
    yearly: 40,
    description: "Everything in Starter, plus advanced tools for growing teams.",
    features: [
      "Up to 5 stores",
      "Unlimited staff accounts",
      "Advanced reports",
      "Stock transfer & warehouses",
      "Priority support",
    ],
    highlighted: false,
  },
  {
    name: "Custom",
    monthly: null,
    yearly: null,
    description: "Everything in Professional, plus custom account management.",
    features: [
      "Unlimited stores",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security & SLA",
      "Onboarding & training",
    ],
    highlighted: true,
  },
]

export function PricingSection() {
  const [yearly, setYearly] = React.useState(false)

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
        <p className="mt-4 text-muted-foreground text-pretty">
          Choose the plan that&apos;s right for your business.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className={yearly ? "text-sm text-muted-foreground" : "text-sm font-medium"}>Billed monthly</span>
          <Switch checked={yearly} onCheckedChange={setYearly} />
          <span className={yearly ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
            Billed yearly <Badge variant="secondary">Save 20%</Badge>
          </span>
        </div>
      </div>
      <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "bg-primary text-primary-foreground ring-0" : "ring-border/50"}
          >
            <CardContent className="flex flex-col gap-5">
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                {plan.monthly ? (
                  <>
                    <span className="text-3xl font-bold">${yearly ? plan.yearly : plan.monthly}</span>
                    <span className={plan.highlighted ? "text-sm text-primary-foreground/80" : "text-sm text-muted-foreground"}>
                      /month
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">Custom</span>
                )}
              </div>
              <p className={plan.highlighted ? "text-sm text-primary-foreground/80" : "text-sm text-muted-foreground"}>
                {plan.description}
              </p>
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? "secondary" : "default"}
                render={<Link href="/acme-retail/dashboard">{plan.monthly ? "Get Started" : "Contact Sales"}</Link>}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
