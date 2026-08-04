"use client"

import { DollarSign, Receipt, ShoppingBag, Truck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { usePurchaseReport } from "../client/useReports"
import type { PurchaseReportData } from "../api/reports.action"
import type { Supplier } from "@/lib/types"

const columns: DataTableColumn<Supplier>[] = [
  { key: "name", header: "Supplier", render: (s) => <span className="font-medium">{s.name}</span> },
  { key: "location", header: "Location", render: (s) => s.location },
  { key: "orders", header: "Purchase Orders", render: (s) => s.totalOrders },
  { key: "due", header: "Amount Due", render: (s) => `$${s.totalDue.toLocaleString()}` },
]

interface PurchaseReportViewProps {
  tenant: string
  initialData: PurchaseReportData
}

export function PurchaseReportView({ tenant, initialData }: PurchaseReportViewProps) {
  const { data } = usePurchaseReport(tenant, initialData)
  const { suppliers, totalOrders, totalDue } = data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Purchase Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Purchase Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShoppingBag className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Purchase Orders</p><p className="text-xl font-bold">{totalOrders}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Truck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Active Suppliers</p><p className="text-xl font-bold">{suppliers.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Amount Due</p><p className="text-xl font-bold">${totalDue.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Receipt className="size-5" /></div><div><p className="text-xs text-muted-foreground">Avg. Order Value</p><p className="text-xl font-bold">${Math.round(totalDue / Math.max(totalOrders, 1))}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={suppliers} rowKey={(s) => s.id} selectable={false} searchPlaceholder="Search suppliers..." getSearchValue={(s) => s.name} />
    </div>
  )
}
