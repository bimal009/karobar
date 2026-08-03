"use client"

import { Bar, BarChart, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { day: "M", tenants: 2 },
  { day: "T", tenants: 3 },
  { day: "W", tenants: 1 },
  { day: "T", tenants: 5 },
  { day: "F", tenants: 4 },
  { day: "S", tenants: 4 },
  { day: "S", tenants: 3 },
]

const config = {
  tenants: { label: "New tenants", color: "var(--chart-1)" },
} satisfies ChartConfig

export function TenantGrowthChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-[180px] w-full">
      <BarChart data={data}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="tenants" fill="var(--color-tenants)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
