import { AlertTriangle, ArrowUpRight, CreditCard, QrCode, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

function MockupCard({
  children,
  label,
  className,
}: {
  children: React.ReactNode
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[26px] bg-card p-6 shadow-[0_40px_90px_-30px_rgba(9,20,66,0.35)] ring-1 ring-border",
        className
      )}
    >
      {label && (
        <div className="mb-4 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
      )}
      {children}
    </div>
  )
}

const posProducts = [
  { name: "Galaxy S24", cat: "Electronics", price: "$899", stock: "8 Pcs", low: true },
  { name: "AirPods Pro", cat: "Electronics", price: "$249", stock: "26 Pcs" },
  { name: "iPhone 15", cat: "Electronics", price: "$999", stock: "69 Pcs" },
  { name: "Study Desk", cat: "Home & Living", price: "$220", stock: "14 Pcs" },
]

export function PosMockup() {
  return (
    <MockupCard label="Point of sale">
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 grid grid-cols-2 gap-3">
          {posProducts.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border bg-muted p-3.5">
              <p className="text-xs font-medium text-primary">{p.cat}</p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">{p.name}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className={cn("text-xs", p.low ? "font-medium text-amber-600" : "text-muted-foreground")}>
                  {p.stock}
                </span>
                <span className="text-sm font-semibold text-foreground">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-2 flex flex-col rounded-2xl bg-brand-navy p-4 text-brand-navy-foreground">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-navy-foreground/50">
            Order · Walk-in
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-navy-foreground/70">Galaxy S24</span>
              <span className="tabular-nums">899.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-navy-foreground/70">AirPods Pro</span>
              <span className="tabular-nums">249.00</span>
            </div>
          </div>
          <div className="mt-3 border-t border-brand-navy-foreground/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-brand-navy-foreground/50">
                Total
              </span>
              <span className="text-xl font-bold tabular-nums">$1,148</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <div className="flex flex-col items-center gap-1 rounded-lg bg-primary py-2">
              <Wallet className="size-3.5" />
              <span className="text-[10px] font-medium">Cash</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-brand-navy-foreground/10 py-2">
              <CreditCard className="size-3.5" />
              <span className="text-[10px] font-medium">Card</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-brand-navy-foreground/10 py-2">
              <QrCode className="size-3.5" />
              <span className="text-[10px] font-medium">Wallet</span>
            </div>
          </div>
        </div>
      </div>
    </MockupCard>
  )
}

const stockRows = [
  { sku: "SAM-S24", item: "Galaxy S24", hand: "8", tag: "Reorder" },
  { sku: "IKEA-SD", item: "Study Desk", hand: "14", tag: "Low" },
  { sku: "SAM-GB", item: "Galaxy Buds", hand: "102", tag: null },
  { sku: "APL-APP", item: "AirPods Pro", hand: "26", tag: null },
]

export function StockMockup() {
  return (
    <MockupCard label="Live stock">
      <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="size-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Galaxy S24</span> is running low, already below 10 pcs.
        </p>
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 font-medium">SKU</th>
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 text-right font-medium">On hand</th>
          </tr>
        </thead>
        <tbody>
          {stockRows.map((r) => (
            <tr key={r.sku} className="border-t border-border">
              <td className="py-2.5 text-muted-foreground">{r.sku}</td>
              <td className="py-2.5 font-medium text-foreground">{r.item}</td>
              <td className="py-2.5 text-right tabular-nums">
                {r.tag ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      r.tag === "Reorder" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    )}
                  >
                    {r.tag}
                  </span>
                ) : (
                  r.hand
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MockupCard>
  )
}

const reportRows = [
  { sku: "SAM-S24", name: "Galaxy S24", qty: "43", amount: "$38,657" },
  { sku: "APL-IP15", name: "iPhone 15", qty: "36", amount: "$35,964" },
  { sku: "APL-APP", name: "AirPods Pro", qty: "26", amount: "$6,474" },
]

export function SalesReportMockup() {
  return (
    <MockupCard label="Sales report">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "New sales", value: "$106,171" },
          { label: "Orders", value: "62" },
          { label: "Customers", value: "6" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-muted p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-base font-bold tabular-nums text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 font-medium">Product</th>
            <th className="pb-2 text-right font-medium">Qty</th>
            <th className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {reportRows.map((r) => (
            <tr key={r.sku} className="border-t border-border">
              <td className="py-2.5 font-medium text-foreground">{r.name}</td>
              <td className="py-2.5 text-right tabular-nums text-muted-foreground">{r.qty}</td>
              <td className="py-2.5 text-right font-semibold tabular-nums text-primary">{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MockupCard>
  )
}

const topSellers = [
  { name: "Galaxy S24", amount: "$38,657", pct: 100 },
  { name: "iPhone 15", amount: "$35,964", pct: 93 },
  { name: "AirPods Pro", amount: "$6,474", pct: 17 },
]

export function ReportHighlightCard() {
  return (
    <MockupCard label="This month">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total revenue</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-foreground">$106,171</p>
        </div>
        <span className="mb-1 flex items-center gap-0.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          <ArrowUpRight className="size-3.5" />
          24.2%
        </span>
      </div>
      <div className="mt-6 space-y-3.5">
        {topSellers.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="tabular-nums text-muted-foreground">{s.amount}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </MockupCard>
  )
}
