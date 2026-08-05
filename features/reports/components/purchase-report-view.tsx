"use client"

import * as React from "react"
import { DollarSign, Truck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { useShell } from "@/components/layout/shell-context"
import { formatCurrency } from "@/lib/common/currency"
import { usePurchaseReport } from "../client/useReports"
import type { PurchaseReportData, PurchaseReportSupplier } from "../api/reports.action"

interface PurchaseReportViewProps {
  tenant: string
  initialData: PurchaseReportData
}

export function PurchaseReportView({ tenant, initialData }: PurchaseReportViewProps) {
  const { currency } = useShell()
  const { data } = usePurchaseReport(tenant, initialData)
  const { suppliers, totalDue } = data
  const [{ q }] = useDataTableParams()
  const filteredSuppliers = React.useMemo(
    () => (q ? suppliers.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())) : suppliers),
    [suppliers, q]
  )

  const columns: DataTableColumn<PurchaseReportSupplier>[] = [
    { key: "name", header: "Supplier", render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "location", header: "Location", render: (s) => s.location ?? "—" },
    { key: "due", header: "Amount Due", render: (s) => formatCurrency(s.totalDue, currency, { maximumFractionDigits: 0 }) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Purchase Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Purchase Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Truck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Active Suppliers</p><p className="text-xl font-bold">{suppliers.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Amount Due</p><p className="text-xl font-bold">{formatCurrency(totalDue, currency, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={filteredSuppliers} total={filteredSuppliers.length} rowKey={(s) => s.id} searchPlaceholder="Search suppliers..." />
    </div>
  )
}
