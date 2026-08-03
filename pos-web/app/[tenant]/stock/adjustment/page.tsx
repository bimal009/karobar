"use client"

import { use } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { FormSheet } from "@/components/shared/form-sheet"
import { FieldRow } from "@/components/shared/field-row"
import { getBranches, getProducts, getStockMovements } from "@/lib/dummy-data"
import type { StockMovement } from "@/lib/types"

const columns: DataTableColumn<StockMovement>[] = [
  {
    key: "product",
    header: "Product",
    render: (m) => (
      <div>
        <p className="font-medium">{m.productName}</p>
        <p className="text-xs text-muted-foreground">{m.sku}</p>
      </div>
    ),
  },
  { key: "before", header: "Qty Before", render: (m) => m.quantityBefore },
  {
    key: "change",
    header: "Change",
    render: (m) => (
      <span className={m.quantityChange < 0 ? "font-medium text-destructive" : "font-medium text-emerald-600"}>
        {m.quantityChange > 0 ? "+" : ""}
        {m.quantityChange}
      </span>
    ),
  },
  { key: "after", header: "Qty After", render: (m) => m.quantityAfter },
  { key: "reason", header: "Reason", render: (m) => m.reason },
  { key: "responsible", header: "Responsible", render: (m) => m.responsible },
  { key: "date", header: "Date", render: (m) => m.date },
]

export default function StockAdjustmentPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const movements = getStockMovements("adjustment")
  const products = getProducts()
  const branches = getBranches()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stock Adjustment"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Stock Adjustment" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> New Adjustment</Button>}
            title="New Stock Adjustment"
            description="Correct a product's stock quantity for a branch."
            submitLabel="Save Adjustment"
          >
            <FieldRow label="Branch" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Product" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Adjustment Quantity" required htmlFor="adj-qty">
              <Input id="adj-qty" type="number" placeholder="e.g. -5 or 10" required />
            </FieldRow>
            <FieldRow label="Reason" required htmlFor="adj-reason">
              <Textarea id="adj-reason" placeholder="e.g. Damaged in transit" rows={3} required />
            </FieldRow>
          </FormSheet>
        }
      />
      <DataTable columns={columns} data={movements} rowKey={(m) => m.id} searchPlaceholder="Search adjustments..." getSearchValue={(m) => `${m.productName} ${m.sku} ${m.responsible}`} />
    </div>
  )
}
