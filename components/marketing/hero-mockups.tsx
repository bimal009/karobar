import { AlertTriangle, ArrowUpRight, Users2 } from "lucide-react"

const sparkline = [22, 34, 28, 46, 38, 58, 44, 64, 52, 72]

export function HeroFloatingCards() {
  return (
    <div className="relative mx-auto flex w-full max-w-4xl items-end justify-center gap-4 px-4 sm:gap-6">
      <div className="hidden w-48 shrink-0 -rotate-6 rounded-2xl bg-card p-4 shadow-[0_20px_50px_-15px_rgba(9,20,66,0.45)] ring-1 ring-border sm:block">
        <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
          <AlertTriangle className="size-4 text-amber-600" />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">Galaxy S24</p>
        <p className="text-xs text-muted-foreground">8 pcs left · reorder now</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[22%] rounded-full bg-amber-500" />
        </div>
      </div>

      <div className="z-10 w-64 shrink-0 rounded-[26px] bg-card p-5 shadow-[0_30px_70px_-20px_rgba(9,20,66,0.55)] ring-1 ring-border sm:w-72">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total sales · today
          </p>
          <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <ArrowUpRight className="size-3" />
            18.4%
          </span>
        </div>
        <p className="mt-2 font-[family-name:var(--font-marketing-heading)] text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          $63,926
        </p>
        <div className="mt-4 flex h-14 items-end gap-1">
          {sparkline.map((v, i) => (
            <div
              key={i}
              className={i === sparkline.length - 1 ? "flex-1 rounded-sm bg-primary" : "flex-1 rounded-sm bg-primary/15"}
              style={{ height: `${v}%` }}
            />
          ))}
        </div>
      </div>

      <div className="hidden w-48 shrink-0 translate-y-5 rotate-6 rounded-2xl bg-card p-4 shadow-[0_20px_50px_-15px_rgba(9,20,66,0.45)] ring-1 ring-border sm:block">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            B
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Jhon Doe</p>
            <p className="text-[11px] text-muted-foreground">Branch admin</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users2 className="size-3.5" />
          <span>6 customers · 62 orders</span>
        </div>
      </div>
    </div>
  )
}
