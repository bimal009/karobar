"use client"

import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface MiniDonutChartProps {
  data: { name: string; value: number; fill: string }[]
  config: ChartConfig
}

export function MiniDonutChart({ data, config }: MiniDonutChartProps) {
  return (
    <ChartContainer config={config} className="aspect-square h-[140px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={38} outerRadius={60} strokeWidth={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
