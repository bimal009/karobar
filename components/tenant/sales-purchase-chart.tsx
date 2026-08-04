"use client"

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { RevenuePoint } from "@/lib/types"

const config = {
  revenue: { label: "Total Sales", color: "var(--chart-4)" },
  expenses: { label: "Total Purchase", color: "var(--chart-2)" },
} satisfies ChartConfig

interface SalesPurchaseChartProps {
  data: RevenuePoint[]
}

export function SalesPurchaseChart({ data }: SalesPurchaseChartProps) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
