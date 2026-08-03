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
import { CategoryIcon } from "@/components/shared/entity-icon"
import { getBranches, getBranchStock, getProductById } from "@/lib/dummy-data"
import type { BranchStock } from "@/lib/types"

interface StockRow extends BranchStock {
  branchName: string
  productName: string
  sku: string
  categoryName: string
  lowStockThreshold: number
}

export default function ManageStockPage() {
  const branches = getBranches()
  const [branchFilter, setBranchFilter] = useQueryState("branch", parseAsString.withDefault("all"))

  const rows: StockRow[] = getBranchStock(branchFilter === "all" ? undefined : branchFilter)
    .map((s) => {
      const product = getProductById(s.productId)
      const branch = branches.find((b) => b.id === s.branchId)
      if (!product || !branch) return null
      return {
        ...s,
        branchName: branch.name,
        productName: product.name,
        sku: product.sku,
        categoryName: product.categoryName,
        lowStockThreshold: product.lowStockThreshold,
      }
    })
    .filter((r): r is StockRow => r !== null)

  const columns: DataTableColumn<StockRow>[] = [
    { key: "branch", header: "Branch", render: (r) => r.branchName },
    {
      key: "product",
      header: "Product Name",
      render: (r) => (
        <div className="flex items-center gap-3">
          <CategoryIcon categoryName={r.categoryName} />
          <div>
            <p className="font-medium">{r.productName}</p>
            <p className="text-xs text-muted-foreground">{r.sku}</p>
          </div>
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
      render: () => (
        <div className="flex justify-end">
          <IconButton label="Edit stock" size="icon-sm" variant="ghost">
            <Pencil />
          </IconButton>
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
          <Button>
            <Plus /> Add Stock
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={rows}
        rowKey={(r) => `${r.branchId}-${r.productId}`}
        searchPlaceholder="Search products..."
        getSearchValue={(r) => `${r.productName} ${r.sku} ${r.branchName}`}
        filters={
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branches.map((b) => (
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
