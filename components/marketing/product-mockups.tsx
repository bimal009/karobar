import { AlertTriangle, CreditCard, QrCode, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

function DeviceFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[22px] bg-white shadow-[0_40px_90px_-30px_rgba(9,20,66,0.35)] ring-1 ring-black/5",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-black/5 bg-[#f7f8fb] px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
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
    <DeviceFrame>
      <div className="grid grid-cols-5 gap-3 p-4">
        <div className="col-span-3 grid grid-cols-2 gap-2.5">
          {posProducts.map((p) => (
            <div key={p.name} className="rounded-xl border border-black/5 bg-[#f7f8fb] p-2.5">
              <p className="text-[10px] font-medium text-[#1057e9]">{p.cat}</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-[#0b1330]">{p.name}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className={cn("text-[10px]", p.low ? "text-amber-600" : "text-[#0b1330]/45")}>
                  {p.stock}
                </span>
                <span className="text-xs font-semibold text-[#0b1330]">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-2 rounded-xl bg-[#0b1330] p-3 text-white">
          <p className="text-[10px] uppercase tracking-wide text-white/50">Order · Walk-in</p>
          <div className="mt-2 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-white/70">Galaxy S24</span>
              <span className="tabular-nums">899.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">AirPods Pro</span>
              <span className="tabular-nums">249.00</span>
            </div>
          </div>
          <div className="mt-2.5 border-t border-white/10 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-white/50">Total</span>
              <span className="text-base font-bold tabular-nums">$1,148</span>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-1">
            <div className="flex flex-col items-center gap-0.5 rounded-md bg-[#1057e9] py-1.5">
              <Wallet className="size-3" />
              <span className="text-[9px]">Cash</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-md bg-white/10 py-1.5">
              <CreditCard className="size-3" />
              <span className="text-[9px]">Card</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-md bg-white/10 py-1.5">
              <QrCode className="size-3" />
              <span className="text-[9px]">Wallet</span>
            </div>
          </div>
        </div>
      </div>
    </DeviceFrame>
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
    <DeviceFrame>
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="size-3.5 shrink-0 text-amber-600" />
          <p className="text-[11px] text-amber-800">
            <span className="font-semibold">Galaxy S24</span> is running low, already below 10 pcs.
          </p>
        </div>
        <table className="mt-3 w-full text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-[#0b1330]/40">
              <th className="pb-1.5 font-medium">SKU</th>
              <th className="pb-1.5 font-medium">Item</th>
              <th className="pb-1.5 text-right font-medium">On hand</th>
            </tr>
          </thead>
          <tbody>
            {stockRows.map((r) => (
              <tr key={r.sku} className="border-t border-black/5">
                <td className="py-1.5 text-[#0b1330]/50">{r.sku}</td>
                <td className="py-1.5 font-medium text-[#0b1330]">{r.item}</td>
                <td className="py-1.5 text-right tabular-nums">
                  {r.tag ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
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
      </div>
    </DeviceFrame>
  )
}

const reportRows = [
  { sku: "SAM-S24", name: "Galaxy S24", qty: "43", amount: "$38,657" },
  { sku: "APL-IP15", name: "iPhone 15", qty: "36", amount: "$35,964" },
  { sku: "APL-APP", name: "AirPods Pro", qty: "26", amount: "$6,474" },
]

export function SalesReportMockup() {
  return (
    <DeviceFrame>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "New sales", value: "$106,171" },
            { label: "Orders", value: "62" },
            { label: "Customers", value: "6" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-[#f7f8fb] p-2">
              <p className="text-[9px] uppercase tracking-wide text-[#0b1330]/40">{s.label}</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-[#0b1330]">{s.value}</p>
            </div>
          ))}
        </div>
        <table className="mt-3 w-full text-left text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-[#0b1330]/40">
              <th className="pb-1.5 font-medium">Product</th>
              <th className="pb-1.5 text-right font-medium">Qty</th>
              <th className="pb-1.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((r) => (
              <tr key={r.sku} className="border-t border-black/5">
                <td className="py-1.5 font-medium text-[#0b1330]">{r.name}</td>
                <td className="py-1.5 text-right tabular-nums text-[#0b1330]/60">{r.qty}</td>
                <td className="py-1.5 text-right font-semibold tabular-nums text-[#1057e9]">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DeviceFrame>
  )
}
