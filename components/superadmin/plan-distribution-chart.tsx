"use client"

import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { plan: "Starter", value: 60, fill: "var(--color-starter)" },
  { plan: "Growth", value: 25, fill: "var(--color-growth)" },
  { plan: "Enterprise", value: 15, fill: "var(--color-enterprise)" },
]

const config = {
  starter: { label: "Starter", color: "var(--chart-1)" },
  growth: { label: "Growth", color: "var(--chart-3)" },
  enterprise: { label: "Enterprise", color: "var(--chart-5)" },
} satisfies ChartConfig

export function PlanDistributionChart() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ChartContainer config={config} className="aspect-square h-[160px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="plan" innerRadius={45} outerRadius={70} strokeWidth={2}>
            {data.map((entry) => (
              <Cell key={entry.plan} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex w-full flex-col gap-2">
        {data.map((entry) => (
          <div key={entry.plan} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.fill }} />
              {entry.plan}
            </span>
            <span className="font-medium">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
