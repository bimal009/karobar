"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import type { Meta } from "@/lib/common/pagination"
import { useStockFormOptions, useStockMovements } from "../client/useStock"
import { StockAdjustmentFormSheet } from "./stock-adjustment-form-sheet"
import type { StockFormOptions, StockMovementRow } from "../api/stock.action"

const columns: DataTableColumn<StockMovementRow>[] = [
  {
    key: "product",
    header: "Product",
    sortKey: "product",
    render: (m) => (
      <div>
        <p className="font-medium">{m.productName}</p>
        <p className="text-xs text-muted-foreground">{m.sku}</p>
      </div>
    ),
  },
  { key: "branch", header: "Branch", render: (m) => m.fromBranchName ?? "—" },
  { key: "before", header: "Qty Before", render: (m) => m.quantityBefore },
  {
    key: "change",
    header: "Change",
    sortKey: "quantityChange",
    render: (m) => (
      <span className={m.quantityChange < 0 ? "font-medium text-destructive" : "font-medium text-emerald-600"}>
        {m.quantityChange > 0 ? "+" : ""}
        {m.quantityChange}
      </span>
    ),
  },
  { key: "after", header: "Qty After", render: (m) => m.quantityAfter },
  { key: "reason", header: "Reason", render: (m) => m.reason ?? "—" },
  { key: "responsible", header: "Responsible", render: (m) => m.responsibleName ?? "—" },
  { key: "date", header: "Date", sortKey: "createdAt", render: (m) => new Date(m.createdAt).toLocaleDateString() },
]

interface StockAdjustmentViewProps {
  tenant: string
  initialData: { rows: StockMovementRow[]; meta: Meta }
  formOptions: StockFormOptions
}

export function StockAdjustmentView({ tenant, initialData, formOptions }: StockAdjustmentViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useStockMovements(
    tenant,
    { type: "adjustment", search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const movements = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { data: options } = useStockFormOptions(tenant, formOptions)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stock Adjustment"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Stock Adjustment" }]}
        actions={
          <StockAdjustmentFormSheet
            tenant={tenant}
            options={options}
            trigger={
              <Button>
                <Plus /> New Adjustment
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={movements}
        total={total}
        isLoading={isFetching}
        rowKey={(m) => m.id}
        searchPlaceholder="Search adjustments..."
      />
    </div>
  )
}
