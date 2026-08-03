import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  delta?: { value: string; positive: boolean }
  tone?: "default" | "primary" | "dark" | "teal" | "blue"
  className?: string
}

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-card text-card-foreground",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-zinc-900 text-white dark:bg-zinc-950",
  teal: "bg-teal-600 text-white",
  blue: "bg-blue-700 text-white",
}

export function StatCard({ label, value, icon: Icon, delta, tone = "default", className }: StatCardProps) {
  const isColored = tone !== "default"
  return (
    <Card className={cn("justify-between gap-4 px-5", tones[tone], className)}>
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            isColored ? "bg-white/15" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-4.5" />
        </div>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              isColored
                ? "bg-white/15"
                : delta.positive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {delta.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {delta.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className={cn("text-sm", isColored ? "text-white/80" : "text-muted-foreground")}>{label}</p>
      </div>
    </Card>
  )
}
