"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { RevenuePoint } from "@/lib/types"

const config = {
  revenue: { label: "Sales", color: "var(--chart-4)" },
} satisfies ChartConfig

interface SalesAnalyticsChartProps {
  data: RevenuePoint[]
}

export function SalesAnalyticsChart({ data }: SalesAnalyticsChartProps) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="revenue" type="monotone" stroke="var(--color-revenue)" fill="url(#fillRevenue)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  )
}
