"use client"

import { parseAsString, useQueryState } from "nuqs"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/shared/icon-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { useBranchStock, useStockFormOptions } from "../client/useStock"
import { StockAdjustmentFormSheet } from "./stock-adjustment-form-sheet"
import type { BranchStockRow, StockFormOptions } from "../api/stock.action"

interface StockManageViewProps {
  tenant: string
  initialData: BranchStockRow[]
  formOptions: StockFormOptions
}

export function StockManageView({ tenant, initialData, formOptions }: StockManageViewProps) {
  const { data: allRows } = useBranchStock(tenant, initialData)
  const { data: options } = useStockFormOptions(tenant, formOptions)
  const [branchFilter, setBranchFilter] = useQueryState("branch", parseAsString.withDefault("all"))

  const rows = branchFilter === "all" ? allRows : allRows.filter((r) => r.branchId === branchFilter)

  const columns: DataTableColumn<BranchStockRow>[] = [
    { key: "branch", header: "Branch", render: (r) => r.branchName },
    {
      key: "product",
      header: "Product Name",
      render: (r) => (
        <div>
          <p className="font-medium">{r.productName}</p>
          <p className="text-xs text-muted-foreground">{r.sku}</p>
        </div>
      ),
    },
    {
      key: "qty",
      header: "Qty",
      render: (r) => (
        <span className={r.quantity <= r.lowStockThreshold ? "font-medium text-destructive" : ""}>{r.quantity}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end">
          <StockAdjustmentFormSheet
            tenant={tenant}
            options={options}
            defaultBranchId={r.branchId}
            defaultProductId={r.productId}
            trigger={
              <IconButton label="Edit stock" size="icon-sm" variant="ghost">
                <Pencil />
              </IconButton>
            }
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Stock"
        crumbs={[{ label: "Dashboard" }, { label: "Manage Stock" }]}
        actions={
          <StockAdjustmentFormSheet
            tenant={tenant}
            options={options}
            trigger={
              <Button>
                <Plus /> Add Stock
              </Button>
            }
          />
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => `${r.branchId}-${r.productId}`}
        searchPlaceholder="Search products..."
        getSearchValue={(r) => `${r.productName} ${r.sku} ${r.branchName}`}
        filters={
          <Select
            items={[{ value: "all", label: "All branches" }, ...options.branches.map((b) => ({ value: b.id, label: b.name }))]}
            value={branchFilter}
            onValueChange={(value) => setBranchFilter(value)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {options.branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
