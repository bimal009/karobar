"use client"

import { DollarSign, TrendingUp, Truck, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useSupplierReport } from "../client/useReports"
import type { SupplierReportData, SupplierReportRow } from "../api/reports.action"

const columns: DataTableColumn<SupplierReportRow>[] = [
  {
    key: "name",
    header: "Supplier",
    render: (s) => (
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {s.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium">{s.name}</span>
      </div>
    ),
  },
  { key: "location", header: "Location", render: (s) => s.location ?? "—" },
  { key: "due", header: "Due Amount", render: (s) => `$${s.totalDue.toLocaleString()}` },
  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
]

interface SupplierReportViewProps {
  tenant: string
  initialData: SupplierReportData
}

export function SupplierReportView({ tenant, initialData }: SupplierReportViewProps) {
  const { data } = useSupplierReport(tenant, initialData)
  const { rows, totalSuppliers, activeSuppliers, totalDue, avgDue } = data

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Supplier Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Supplier Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Truck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Suppliers</p><p className="text-xl font-bold">{totalSuppliers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserCheck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Active Suppliers</p><p className="text-xl font-bold">{activeSuppliers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Due</p><p className="text-xl font-bold">${totalDue.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-5" /></div><div><p className="text-xs text-muted-foreground">Avg. Due</p><p className="text-xl font-bold">${avgDue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={rows} rowKey={(s) => s.id} selectable={false} searchPlaceholder="Search suppliers..." getSearchValue={(s) => s.name} />
    </div>
  )
}
