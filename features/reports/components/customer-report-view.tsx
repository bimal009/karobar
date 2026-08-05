"use client"

import * as React from "react"
import { DollarSign, TrendingUp, UserCheck, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, useDataTableParams, type DataTableColumn } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { useShell } from "@/components/layout/shell-context"
import { formatCurrency } from "@/lib/common/currency"
import { useCustomerReport } from "../client/useReports"
import type { CustomerReportData, CustomerReportRow } from "../api/reports.action"

interface CustomerReportViewProps {
  tenant: string
  initialData: CustomerReportData
}

export function CustomerReportView({ tenant, initialData }: CustomerReportViewProps) {
  const { currency } = useShell()
  const { data } = useCustomerReport(tenant, initialData)
  const { rows, totalCustomers, activeCustomers, totalSpent, avgSpent } = data
  const [{ q }] = useDataTableParams()
  const filteredRows = React.useMemo(
    () => (q ? rows.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : rows),
    [rows, q]
  )

  const columns: DataTableColumn<CustomerReportRow>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{c.name}</span>
        </div>
      ),
    },
    { key: "location", header: "Location", render: (c) => c.location ?? "—" },
    { key: "orders", header: "Total Orders", render: (c) => c.totalOrders },
    { key: "spent", header: "Total Spent", render: (c) => formatCurrency(c.totalSpent, currency, { maximumFractionDigits: 0 }) },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customer Report" crumbs={[{ label: "Dashboard", href: `/${tenant}/dashboard` }, { label: "Customer Report" }]} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Customers</p><p className="text-xl font-bold">{totalCustomers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserCheck className="size-5" /></div><div><p className="text-xs text-muted-foreground">Active Customers</p><p className="text-xl font-bold">{activeCustomers}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><DollarSign className="size-5" /></div><div><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-xl font-bold">{formatCurrency(totalSpent, currency, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><TrendingUp className="size-5" /></div><div><p className="text-xs text-muted-foreground">Avg. Spent</p><p className="text-xl font-bold">{formatCurrency(avgSpent, currency, { maximumFractionDigits: 0 })}</p></div></CardContent></Card>
      </div>
      <DataTable columns={columns} data={filteredRows} total={filteredRows.length} rowKey={(c) => c.id} searchPlaceholder="Search customers..." />
    </div>
  )
}
