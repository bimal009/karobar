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
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import type { Meta } from "@/lib/common/pagination"
import { useBranchStock, useStockFormOptions } from "../client/useStock"
import { StockAdjustmentFormSheet } from "./stock-adjustment-form-sheet"
import type { BranchStockRow, StockFormOptions } from "../api/stock.action"

interface StockManageViewProps {
  tenant: string
  initialData: { rows: BranchStockRow[]; meta: Meta }
  formOptions: StockFormOptions
}

export function StockManageView({ tenant, initialData, formOptions }: StockManageViewProps) {
  const { data: options } = useStockFormOptions(tenant, formOptions)
  const [branchFilter, setBranchFilter] = useQueryState("branch", parseAsString.withDefault("all"))
  const [{ q, page, pageSize, sortBy, sortOrder }] = useDataTableParams()

  const { data, isFetching } = useBranchStock(
    tenant,
    {
      search: q || undefined,
      page,
      limit: pageSize,
      sortBy: sortBy || undefined,
      sortOrder,
      branchId: branchFilter === "all" ? undefined : branchFilter,
    },
    initialData
  )
  const rows = data?.rows ?? []
  const total = data?.meta.total ?? 0

  const columns: DataTableColumn<BranchStockRow>[] = [
    { key: "branch", header: "Branch", sortKey: "branch", render: (r) => r.branchName },
    {
      key: "product",
      header: "Product Name",
      sortKey: "product",
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
      sortKey: "quantity",
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
        total={total}
        isLoading={isFetching}
        rowKey={(r) => `${r.branchId}-${r.productId}`}
        searchPlaceholder="Search products..."
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
