"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import type { Meta } from "@/lib/common/pagination"
import { useStockFormOptions, useStockMovements } from "../client/useStock"
import { StockTransferFormSheet } from "./stock-transfer-form-sheet"
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
  { key: "from", header: "From", render: (m) => m.fromBranchName ?? "—" },
  { key: "to", header: "To", render: (m) => m.toBranchName ?? "—" },
  { key: "qty", header: "Qty Transferred", sortKey: "quantityChange", render: (m) => Math.abs(m.quantityChange) },
  { key: "reason", header: "Reason", render: (m) => m.reason ?? "—" },
  { key: "responsible", header: "Responsible", render: (m) => m.responsibleName ?? "—" },
  { key: "date", header: "Date", sortKey: "createdAt", render: (m) => new Date(m.createdAt).toLocaleDateString() },
]

interface StockTransferViewProps {
  tenant: string
  initialData: { rows: StockMovementRow[]; meta: Meta }
  formOptions: StockFormOptions
}

export function StockTransferView({ tenant, initialData, formOptions }: StockTransferViewProps) {
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()
  const { data, isFetching } = useStockMovements(
    tenant,
    { type: "transfer", search: q || undefined, page, limit: pageSize, sortBy: sortBy || undefined, sortOrder },
    initialData
  )
  const movements = data?.rows ?? []
  const total = data?.meta.total ?? 0
  const { data: options } = useStockFormOptions(tenant, formOptions)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stock Transfer"
        crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Stock Transfer" }]}
        actions={
          <StockTransferFormSheet
            tenant={tenant}
            options={options}
            trigger={
              <Button>
                <Plus /> New Transfer
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
        searchPlaceholder="Search transfers..."
      />
    </div>
  )
}
