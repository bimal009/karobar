"use client"

import * as React from "react"
import { DollarSign, TrendingUp, Truck, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useShell } from "@/components/layout/shell-context"
import { formatCurrency } from "@/lib/common/currency"
import { useSupplierReport } from "../client/useReports"
import type { SupplierReportData, SupplierReportRow } from "../api/reports.action"

interface SupplierReportViewProps {
  tenant: string
  initialData: SupplierReportData
}

export function SupplierReportView({ tenant, initialData }: SupplierReportViewProps) {
  const { currency } = useShell()
  const { data } = useSupplierReport(tenant, initialData)
  const { rows, totalSuppliers, activeSuppliers, totalDue, avgDue } = data
  const [{ q }] = useDataTableParams()
  const filteredRows = React.useMemo(
    () => (q ? rows.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) : rows),
    [rows, q]
  )

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
    { key: "due", header: "Due Amount", render: (s) => formatCurrency(s.totalDue, currency, { maximumFractionDigits: 0 }) },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Supplier Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Supplier Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Truck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Suppliers</p><p className="text-xl font-bold">{totalSuppliers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserCheck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Active Suppliers</p><p className="text-xl font-bold">{activeSuppliers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Due</p><p className="text-xl font-bold">{formatCurrency(totalDue, currency, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-5" /></div><div><p className="text-xs text-muted-foreground">Avg. Due</p><p className="text-xl font-bold">{formatCurrency(avgDue, currency, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={filteredRows} total={filteredRows.length} rowKey={(s) => s.id} searchPlaceholder="Search suppliers..." />
    </div>
  )
}
