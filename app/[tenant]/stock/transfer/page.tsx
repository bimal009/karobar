"use client"

import { use } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  { key: "from", header: "From", render: (m) => m.fromStore },
  { key: "to", header: "To", render: (m) => m.toStore },
  { key: "qty", header: "Qty Transferred", render: (m) => Math.abs(m.quantityChange) },
  { key: "reason", header: "Reason", render: (m) => m.reason },
  { key: "responsible", header: "Responsible", render: (m) => m.responsible },
  { key: "date", header: "Date", render: (m) => m.date },
]

export default function StockTransferPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = use(params)
  const movements = getStockMovements("transfer")
  const products = getProducts()
  const branches = getBranches()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stock Transfer"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Stock Transfer" }]}
        actions={
          <FormSheet
            trigger={<Button><Plus /> New Transfer</Button>}
            title="New Stock Transfer"
            description="Move stock from one branch to another."
            submitLabel="Save Transfer"
          >
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
            <FieldRow label="From Branch" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="To Branch" required>
              <Select required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
            <FieldRow label="Quantity" required htmlFor="transfer-qty">
              <Input id="transfer-qty" type="number" min={1} placeholder="e.g. 20" required />
            </FieldRow>
            <FieldRow label="Reason" htmlFor="transfer-reason">
              <Input id="transfer-reason" placeholder="e.g. Store replenishment" />
            </FieldRow>
          </FormSheet>
        }
      />
      <DataTable columns={columns} data={movements} rowKey={(m) => m.id} searchPlaceholder="Search transfers..." getSearchValue={(m) => `${m.productName} ${m.sku} ${m.fromStore} ${m.toStore}`} />
    </div>
  )
}
